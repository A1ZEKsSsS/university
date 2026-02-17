import React, { useCallback } from 'react';
import {
    useStore,
    getSmoothStepPath,
    BaseEdge,
    EdgeLabelRenderer
} from 'reactflow';

// Расстояние между стрелками
const SHIFT = 16;

export default function SmartStepEdge({
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
    // 1. ХИТРОСТЬ: Мы подписываемся на ВСЕ ребра.
    // Это заставит этот компонент обновляться при любом добавлении/удалении связей.
    const edges = useStore(useCallback((store) => store.edges, []));

    // 2. Ищем все линии, которые входят в этот же узел (target)
    // и с той же стороны (targetPosition)
    const siblings = edges.filter(e =>
        e.target === target &&
        e.targetHandle === (targetPosition || null) // Обычно null, если нет handleId
    );

    // 3. Если мы одни — рисуем обычную линию без расчетов
    if (siblings.length <= 1) {
        const [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition,
            targetX, targetY, targetPosition,
            borderRadius: 20,
        });
        return <EdgeWithLabel path={edgePath} label={label} lx={labelX} ly={labelY} style={style} markerEnd={markerEnd} />;
    }

    // 4. Сортируем линии по ID источника (чтобы порядок не прыгал)
    const sortedSiblings = siblings.sort((a, b) => a.source.localeCompare(b.source));
    const index = sortedSiblings.findIndex(e => e.id === id);

    // 5. Считаем смещение
    // Пример для 3 линий: -16, 0, +16
    const total = sortedSiblings.length;
    const offset = (index - (total - 1) / 2) * SHIFT;

    // 6. Применяем смещение
    let finalTargetX = targetX;
    let finalTargetY = targetY;

    // Если линия подходит вертикально (сверху/снизу) -> двигаем по X
    if (targetPosition === 'top' || targetPosition === 'bottom') {
        finalTargetX += offset;
    }
    // Если линия подходит горизонтально (слева/справа) -> двигаем по Y
    else {
        finalTargetY += offset;
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

    return <EdgeWithLabel path={edgePath} label={label} lx={labelX} ly={labelY} style={style} markerEnd={markerEnd} />;
}

// Вспомогательный компонент для чистоты кода
function EdgeWithLabel({ path, label, lx, ly, style, markerEnd }) {
    return (
        <>
            <BaseEdge path={path} markerEnd={markerEnd} style={style} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${lx}px,${ly}px)`,
                            background: '#fff',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#495057',
                            pointerEvents: 'all',
                            zIndex: 100 // Текст поверх линий
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}