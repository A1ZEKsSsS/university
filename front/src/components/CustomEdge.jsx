import React, { useCallback } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useStore
} from 'reactflow';

// Расстояние между соседними стрелками (в пикселях)
const GAP = 15;

export default function CustomEdge({
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
    label
}) {
    // 1. Получаем список всех ребер через внутренний Store (самый быстрый способ)
    // Мы подписываемся на изменение краев, чтобы пересчитывать отступы при добавлении новых
    const edges = useStore(useCallback((store) => store.edges, []));
    const nodes = useStore(useCallback((store) => store.nodeInternals, []));

    // 2. Находим все линии, которые входят в ЭТОТ ЖЕ узел (target) и с ТОЙ ЖЕ стороны (targetPosition)
    const siblings = edges.filter(e =>
        e.target === target &&
        e.targetHandle === targetPosition // Если используете handles (по умолчанию null, так что ок)
    );

    // 3. Сортируем линии, чтобы порядок был предсказуемым
    // Логика: сортируем по координате источника (source node Y или X)
    // Это гарантирует, что линии не будут пересекаться крест-накрест
    const sortedSiblings = siblings.sort((a, b) => {
        const nodeA = nodes.get(a.source);
        const nodeB = nodes.get(b.source);
        if (!nodeA || !nodeB) return 0;

        // Если вход сверху/снизу — сортируем по X источника
        if (targetPosition === 'top' || targetPosition === 'bottom') {
            return nodeA.position.x - nodeB.position.x;
        }
        // Если вход слева/справа — сортируем по Y источника
        return nodeA.position.y - nodeB.position.y;
    });

    // 4. Узнаем, какие мы по счету в этой очереди
    const index = sortedSiblings.findIndex(e => e.id === id);
    const total = sortedSiblings.length;

    // 5. Вычисляем смещение (чтобы группа была по центру)
    // Пример для 3 линий: -15px, 0px, +15px
    let offset = 0;
    if (index !== -1 && total > 1) {
        offset = (index - (total - 1) / 2) * GAP;
    }

    // 6. Применяем смещение к координатам входа (Target)
    let finalTargetX = targetX;
    let finalTargetY = targetY;

    // В зависимости от того, с какой стороны заходит линия, сдвигаем X или Y
    if (targetPosition === 'left' || targetPosition === 'right') {
        finalTargetY += offset;
    } else {
        finalTargetX += offset;
    }

    // 7. Строим путь
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX: finalTargetX,
        targetY: finalTargetY,
        targetPosition,
        borderRadius: 20,
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: '#fff',
                            padding: '2px 5px',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            zIndex: 10,
                            pointerEvents: 'all', // Чтобы текст можно было выделить
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}