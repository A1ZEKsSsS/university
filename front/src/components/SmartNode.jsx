import React, { memo, useMemo } from 'react';
import { Handle, Position, useStore } from 'reactflow';

// Минимальная ширина узла
const MIN_WIDTH = 100;
// Сколько пикселей выделять на один порт (чтобы не было тесно)
const HANDLE_SPACING = 20;

const SmartNode = ({ id, data, isConnectable }) => {
    // 1. Достаем все ребра из Store (это реактивно и быстро)
    const edges = useStore((s) => s.edges);

    // 2. Фильтруем связи для ЭТОГО узла
    // useMemo нужен, чтобы не пересчитывать это при каждом чихе мыши
    const { incoming, outgoing } = useMemo(() => {
        return {
            incoming: edges.filter((e) => e.target === id),
            outgoing: edges.filter((e) => e.source === id),
        };
    }, [edges, id]);

    // 3. Считаем количество портов
    // Минимум 1 порт, даже если связей нет (чтобы можно было подключить новую)
    const incomingCount = Math.max(1, incoming.length);
    const outgoingCount = Math.max(1, outgoing.length);

    // 4. Расчет ширины узла
    // Берем большую сторону (например, 5 выходов и 2 входа -> считаем по 5)
    const maxPorts = Math.max(incomingCount, outgoingCount);
    // Формула: База + (Количество * Отступ)
    const dynamicWidth = Math.max(MIN_WIDTH, maxPorts * HANDLE_SPACING + 40);

    // Вспомогательная функция для расчета позиции порта (в %)
    // Равномерно распределяет точки: 25%, 50%, 75% и т.д.
    const getHandleLeft = (index, total) => {
        return `${(100 / (total + 1)) * (index + 1)}%`;
    };

    return (
        <div
            className="smart-node"
            style={{
                background: '#fff',
                border: '1px solid #333', // Можно менять цвет границы при выделении
                borderRadius: '8px',
                padding: '10px 0', // Убрали боковые паддинги, ширина задается явно
                width: `${dynamicWidth}px`, // <--- ДИНАМИЧЕСКАЯ ШИРИНА
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                transition: 'width 0.2s ease', // Плавная анимация роста
            }}
        >
            {/* --- ВХОДЯЩИЕ (Сверху - Target) --- */}
            {Array.from({ length: incomingCount }).map((_, i) => (
                <Handle
                    key={`target-${i}`}
                    type="target"
                    position={Position.Top}
                    id={`t-${i}`} // ID порта: t-0, t-1...
                    isConnectable={isConnectable}
                    style={{
                        left: getHandleLeft(i, incomingCount),
                        top: -6,
                        background: '#555',
                        width: 10,
                        height: 10,
                        border: '2px solid #fff',
                    }}
                />
            ))}

            {/* Текст узла */}
            <div style={{ padding: '0 10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.label}
            </div>

            {/* --- ИСХОДЯЩИЕ (Снизу - Source) --- */}
            {Array.from({ length: outgoingCount }).map((_, i) => (
                <Handle
                    key={`source-${i}`}
                    type="source"
                    position={Position.Bottom}
                    id={`s-${i}`} // ID порта: s-0, s-1...
                    isConnectable={isConnectable}
                    style={{
                        left: getHandleLeft(i, outgoingCount),
                        bottom: -6,
                        background: '#555',
                        width: 10,
                        height: 10,
                        border: '2px solid #fff',
                    }}
                />
            ))}
        </div>
    );
};

export default memo(SmartNode);