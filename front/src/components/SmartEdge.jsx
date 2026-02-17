// components/SmartEdge.jsx
import React, { useCallback } from 'react';
import {
    useStore,
    getSmoothStepPath, // Используем прямые углы (как у вас в дизайне)
    BaseEdge,
    EdgeLabelRenderer,
    Position
} from 'reactflow';

// Настройка отступа (расстояние между стрелками)
const EDGE_SPACING = 20;

function SmartEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label }) {

    // 1. Получаем все ребра из хранилища React Flow
    const edges = useStore(useCallback((s) => s.edges, []));

    // 2. Ищем "соседей" — линии, которые идут к ТОМУ ЖЕ целевому узлу и к ТОЙ ЖЕ стороне (handle)
    const targetEdges = edges.filter(e =>
        e.target === target &&
        e.source !== source // Исключаем самопересечения, если нужно
    );

    // Сортируем их по ID источника, чтобы порядок был всегда одинаковый
    targetEdges.sort((a, b) => a.source.localeCompare(b.source));

    // 3. Узнаем, какие мы по счету в этом списке
    const index = targetEdges.findIndex(e => e.id === id);

    // Если мы не нашли себя (странно, но бывает) или мы одни — смещения нет
    const total = targetEdges.length;

    // 4. Вычисляем смещение (Shift)
    // Формула центрирует группу. Например, если 3 линии: -20px, 0px, +20px
    let shift = 0;
    if (total > 1 && index !== -1) {
        shift = (index - (total - 1) / 2) * EDGE_SPACING;
    }

    // 5. Применяем смещение к координатам ЦЕЛИ (Target)
    // Если линия подходит сверху/снизу -> смещаем по X
    // Если линия подходит слева/справа -> смещаем по Y
    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (targetPosition === Position.Top || targetPosition === Position.Bottom) {
        finalTargetX += shift;
    } else {
        finalTargetY += shift;
    }

    // 6. Строим путь с новыми координатами
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX: finalTargetX, // Используем смещенный X
        targetY: finalTargetY, // Используем смещенный Y
        targetPosition,
        borderRadius: 20, // Радиус скругления
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {/* Лейбл (вес) */}
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: '#ffffff',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: '#495057',
                            pointerEvents: 'all',
                            zIndex: 10,
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default SmartEdge;