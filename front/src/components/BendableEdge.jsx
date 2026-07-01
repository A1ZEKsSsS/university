import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useReactFlow,
    MarkerType,
} from 'reactflow';
// import './BendableEdge.css';

const DEFAULT_EDGE_COLOR = '#b1b1b7';

// Поріг початку драгу (у пікселях). Клік без руху на drag-handle не викликає setEdges.
const DRAG_THRESHOLD = 3;

const DIRECTIONS = [
    { code: 1, label: '↔', title: 'Двостороння' },
    { code: 3, label: '→', title: 'Пряма' },
    { code: 2, label: '←', title: 'Зворотна' },
    { code: 0, label: '—', title: 'Без стрілок' },
];

const buildArrowEnd = (color = DEFAULT_EDGE_COLOR) => ({
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color,
});

const buildArrowStart = (color = DEFAULT_EDGE_COLOR) => ({
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color,
    orient: 'auto-start-reverse',
});

const SmartBendableEdge = ({
    id,
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
    selected,
}) => {
    const { setEdges, screenToFlowPosition } = useReactFlow();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Тримаємо актуальні mid-координати в ref, щоб drag-handler міг читати їх без
    // пересоздання замикання на кожному ренедері.
    const midRef = useRef({ x: 0, y: 0 });
    midRef.current = { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 };

    const manualOffsetX = data?.offsetX ?? 0;
    const manualOffsetY = data?.offsetY ?? 0;
    const isManuallyBent = manualOffsetX !== 0 || manualOffsetY !== 0;

    const midX = midRef.current.x;
    const midY = midRef.current.y;
    const controlX = midX + manualOffsetX;
    const controlY = midY + manualOffsetY;

    let edgePath;
    let labelX;
    let labelY;

    if (isManuallyBent) {
        edgePath = `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
        // Точка на квадратичній кривій Безьє при t=0.5
        const t = 0.5;
        const mt = 1 - t;
        labelX = mt * mt * sourceX + 2 * mt * t * controlX + t * t * targetX;
        labelY = mt * mt * sourceY + 2 * mt * t * controlY + t * t * targetY;
    } else {
        [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            borderRadius: 20,
        });
    }

    // --- Закриття меню по кліку зовні ---
    // Використовуємо 'click', а не 'mousedown', щоб клік по кнопці меню
    // встиг спрацювати раніше, ніж спрацює закриття.
    useEffect(() => {
        if (!showMenu) return undefined;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showMenu]);

    // --- Drag-handle: згинання ребра ---
    // Фіксовано: pointer events + capture, threshold, rAF-троттлінг.
    const onPointerDown = useCallback(
        (event) => {
            event.stopPropagation();
            event.preventDefault();

            const startX = event.clientX;
            const startY = event.clientY;
            const targetEl = event.currentTarget;

            let isDragging = false;
            let rafId = null;
            let pendingEvent = null;

            try {
                targetEl.setPointerCapture(event.pointerId);
            } catch {
                // Якщо capture не підтримується — нічого страшного
            }

            const applyMove = (moveEvent) => {
                const flowPos = screenToFlowPosition({
                    x: moveEvent.clientX,
                    y: moveEvent.clientY,
                });
                const newOffsetX = (flowPos.x - midRef.current.x) * 2;
                const newOffsetY = (flowPos.y - midRef.current.y) * 2;

                setEdges((eds) =>
                    eds.map((e) => {
                        if (e.id !== id) return e;
                        return {
                            ...e,
                            data: { ...e.data, offsetX: newOffsetX, offsetY: newOffsetY },
                        };
                    })
                );
            };

            const handlePointerMove = (moveEvent) => {
                if (!isDragging) {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;
                    if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
                        return;
                    }
                    isDragging = true;
                }

                pendingEvent = moveEvent;
                if (rafId === null) {
                    rafId = requestAnimationFrame(() => {
                        rafId = null;
                        if (pendingEvent) applyMove(pendingEvent);
                    });
                }
            };

            const handlePointerUp = () => {
                if (rafId !== null) cancelAnimationFrame(rafId);
                targetEl.removeEventListener('pointermove', handlePointerMove);
                targetEl.removeEventListener('pointerup', handlePointerUp);
                targetEl.removeEventListener('pointercancel', handlePointerUp);
                try {
                    targetEl.releasePointerCapture(event.pointerId);
                } catch {
                    // ignore
                }
            };

            targetEl.addEventListener('pointermove', handlePointerMove);
            targetEl.addEventListener('pointerup', handlePointerUp);
            targetEl.addEventListener('pointercancel', handlePointerUp);
        },
        [id, setEdges, screenToFlowPosition]
    );

    // --- Вибір напрямку ---
    const handleDirectionSelect = useCallback(
        (code) => {
            const isBiDir = code === 1;
            const isForward = code === 3;
            const isReverse = code === 2;

            setEdges((eds) =>
                eds.map((e) => {
                    if (e.id !== id) return { ...e, zIndex: 0 };
                    return {
                        ...e,
                        zIndex: 100,
                        data: { ...e.data, directionCode: code },
                        markerEnd: isBiDir || isForward ? buildArrowEnd() : undefined,
                        markerStart: isBiDir || isReverse ? buildArrowStart() : undefined,
                    };
                })
            );
            setShowMenu(false);
        },
        [id, setEdges]
    );

    // --- Скидання згину (подвійний клік по drag-handle) ---
    const onResetBend = useCallback(
        (event) => {
            event.stopPropagation();
            setEdges((eds) =>
                eds.map((e) => {
                    if (e.id !== id) return e;
                    return {
                        ...e,
                        data: { ...e.data, offsetX: 0, offsetY: 0 },
                    };
                })
            );
        },
        [id, setEdges]
    );

    // --- Відкриття меню напрямків по подвійному кліку по ребру ---
    const onEdgeDoubleClick = useCallback((event) => {
        event.stopPropagation();
        event.preventDefault();
        setShowMenu(true);
    }, []);

    return (
        <>
            <BaseEdge path={edgePath} markerStart={markerStart} markerEnd={markerEnd} style={style} />

            {/* Прозора «товста» зона для кліків. Зменшено з 20 до 14 — менше перекриттів. */}
            <path
                d={edgePath}
                strokeWidth={14}
                stroke="transparent"
                fill="none"
                onDoubleClick={onEdgeDoubleClick}
                className="bendable-edge__hit"
            />

            {label && (
                <EdgeLabelRenderer>
                    <div
                        className="bendable-edge__label"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 14}px)`,
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}

            {selected && !showMenu && (
                <EdgeLabelRenderer>
                    <div
                        onPointerDown={onPointerDown}
                        onDoubleClick={onResetBend}
                        className="bendable-edge__handle"
                        title="Перетягніть, щоб зігнути. Подвійний клік — скинути"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    />
                </EdgeLabelRenderer>
            )}

            {showMenu && (
                <EdgeLabelRenderer>
                    <div
                        ref={menuRef}
                        className="bendable-edge__menu"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 45}px)`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {DIRECTIONS.map((dir) => {
                            const isActive = data?.directionCode === dir.code;
                            return (
                                <button
                                    key={dir.code}
                                    type="button"
                                    onClick={() => handleDirectionSelect(dir.code)}
                                    title={dir.title}
                                    className={`bendable-edge__dir-btn ${isActive ? 'is-active' : ''
                                        }`}
                                >
                                    {dir.label}
                                </button>
                            );
                        })}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default SmartBendableEdge;
