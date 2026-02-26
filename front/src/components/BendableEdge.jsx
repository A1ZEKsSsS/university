import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useStore,
    useReactFlow,
    MarkerType
} from 'reactflow';

const SHIFT = 16;

const DIRECTIONS = [
    { code: 1, label: '↔', title: 'Двусторонняя' },
    { code: 3, label: '→', title: 'Прямая' },
    { code: 2, label: '←', title: 'Обратная' },
    { code: 0, label: '—', title: 'Без стрелок' }
];

const SmartBendableEdge = ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    markerStart,
    label,
    data,
    selected
}) => {
    const { setEdges, screenToFlowPosition } = useReactFlow();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const edges = useStore(useCallback((store) => store.edges, []));
    const siblings = edges.filter(e => e.target === target && e.targetHandle === (targetPosition || null));
    const sortedSiblings = siblings.sort((a, b) => a.source.localeCompare(b.source));
    const index = sortedSiblings.findIndex(e => e.id === id);
    const total = sortedSiblings.length;

    const offset = total > 1 ? (index - (total - 1) / 2) * SHIFT : 0;
    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (targetPosition === 'top' || targetPosition === 'bottom') {
        finalTargetX += offset;
    } else {
        finalTargetY += offset;
    }

    const manualOffsetX = data?.offsetX || 0;
    const manualOffsetY = data?.offsetY || 0;
    const isManuallyBent = manualOffsetX !== 0 || manualOffsetY !== 0;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const controlX = midX + manualOffsetX;
    const controlY = midY + manualOffsetY;

    let edgePath, labelX, labelY;

    if (isManuallyBent) {
        edgePath = `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
        const t = 0.5;
        const mt = 1 - t;
        labelX = mt * mt * sourceX + 2 * mt * t * controlX + t * t * targetX;
        labelY = mt * mt * sourceY + 2 * mt * t * controlY + t * t * targetY;
    } else {
        [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition,
            targetX: finalTargetX, targetY: finalTargetY, targetPosition,
            borderRadius: 20,
        });
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const onMouseDown = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();

        const handleMouseMove = (moveEvent) => {
            const flowPos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            const newOffsetX = (flowPos.x - midX) * 2;
            const newOffsetY = (flowPos.y - midY) * 2;

            setEdges((eds) =>
                eds.map((e) => {
                    if (e.id === id) {
                        return { ...e, data: { ...e.data, offsetX: newOffsetX, offsetY: newOffsetY } };
                    }
                    return e;
                })
            );
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [id, midX, midY, setEdges, screenToFlowPosition]);

    const handleDirectionSelect = (code) => {
        const isBiDir = code === 1;
        const isForward = code === 3;
        const isReverse = code === 2;

        const ARROW_END = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#b1b1b7' };
        const ARROW_START = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#b1b1b7', orient: 'auto-start-reverse' };

        setEdges((eds) => eds.map((e) => {
            if (e.id === id) {
                return {
                    ...e,
                    zIndex: 100,
                    data: { ...e.data, directionCode: code },
                    markerEnd: (isBiDir || isForward) ? ARROW_END : undefined,
                    markerStart: (isBiDir || isReverse) ? ARROW_START : undefined,
                };
            }
            return { ...e, zIndex: 0 };
        }));

        setShowMenu(false);
    };

    const onResetBend = useCallback((event) => {
        event.stopPropagation();
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === id) {
                    return { ...e, data: { ...e.data, offsetX: 0, offsetY: 0 } };
                }
                return e;
            })
        );
    }, [id, setEdges]);

    const onEdgeDoubleClick = useCallback((event) => {
        event.stopPropagation();
        setShowMenu(true);
    }, []);

    return (
        <>
            <BaseEdge path={edgePath} markerStart={markerStart} markerEnd={markerEnd} style={style} />

            <path
                d={edgePath}
                strokeWidth={20}
                stroke="transparent"
                fill="none"
                onDoubleClick={onEdgeDoubleClick}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
            />

            {label && (
                <EdgeLabelRenderer>
                    <div style={{
                        position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 14}px)`,
                        background: '#fff', padding: '2px 5px', borderRadius: '4px',
                        border: '1px solid #dee2e6', fontSize: '11px', fontWeight: '700',
                        color: '#495057', pointerEvents: 'all', zIndex: 100
                    }}>
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}

            {selected && !showMenu && (
                <EdgeLabelRenderer>
                    <div
                        onMouseDown={onMouseDown}
                        onDoubleClick={onResetBend}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            width: '14px', height: '14px', background: '#3b82f6', borderRadius: '50%',
                            border: '2px solid white', cursor: 'grab', pointerEvents: 'all', zIndex: 1001,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', userSelect: 'none'
                        }}
                    />
                </EdgeLabelRenderer>
            )}

            {showMenu && (
                <EdgeLabelRenderer>
                    <div
                        ref={menuRef}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 45}px)`,
                            background: 'white',
                            padding: '4px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: '4px',
                            pointerEvents: 'all',
                            zIndex: 2000
                        }}
                    >
                        {DIRECTIONS.map((dir) => (
                            <button
                                key={dir.code}
                                onClick={() => handleDirectionSelect(dir.code)}
                                title={dir.title}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    background: data?.directionCode === dir.code ? '#eff6ff' : 'white',
                                    color: data?.directionCode === dir.code ? '#3b82f6' : '#64748b',
                                    borderRadius: '4px',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}
                            >
                                {dir.label}
                            </button>
                        ))}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default SmartBendableEdge;