import React, { useCallback } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useStore,
    useReactFlow
} from 'reactflow';

const SHIFT = 16;

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

    const onMouseDown = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();

        const handleMouseMove = (moveEvent) => {
            const flowPos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            const newOffsetX = flowPos.x - midX;
            const newOffsetY = flowPos.y - midY;

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

    return (
        <>
            {/* ПЕРЕДАЕМ ПРОПСЫ В БАЗОВУЮ ЛИНИЮ */}
            <BaseEdge path={edgePath} markerStart={markerStart} markerEnd={markerEnd} style={style} />

            {/* Текст (вес) */}
            {label && (
                <EdgeLabelRenderer>
                    <div style={{
                        position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: '#fff', padding: '2px 5px', borderRadius: '4px',
                        border: '1px solid #dee2e6', fontSize: '11px', fontWeight: '700',
                        color: '#495057', pointerEvents: 'all', zIndex: 100
                    }}>
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Рычажок */}
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        onMouseDown={onMouseDown}
                        onDoubleClick={onResetBend}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${isManuallyBent ? controlX : labelX}px,${isManuallyBent ? controlY : labelY - 20}px)`,
                            width: '14px', height: '14px', background: '#228be6', borderRadius: '50%',
                            border: '2px solid white', cursor: 'grab', pointerEvents: 'all', zIndex: 1001,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', userSelect: 'none'
                        }}
                    />
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default SmartBendableEdge;