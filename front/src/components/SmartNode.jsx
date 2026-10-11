import React, { memo, useCallback } from 'react';
import { Handle, Position, useStore } from 'reactflow';


const MIN_WIDTH = 100;
const HANDLE_SPACING = 20;
const HANDLE_PADDING = 40;

const DEFAULT_BG = '#ffffff';

// Темний або світлий текст залежно від фону (формула W3C)
const getTextColor = (hex) => {
    if (!hex || hex === DEFAULT_BG) return '#1a1a1a';
    const h = hex.replace('#', '');
    if (h.length < 6) return '#1a1a1a';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
        ? '#1a1a1a'
        : '#ffffff';
};

// Рамка трохи темніша за фон
const getBorderColor = (hex) => {
    if (!hex || hex === DEFAULT_BG) return '#333333';
    const h = hex.replace('#', '');
    if (h.length < 6) return '#333333';
    const r = Math.max(0, parseInt(h.slice(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(h.slice(2, 4), 16) - 40);
    const b = Math.max(0, parseInt(h.slice(4, 6), 16) - 40);
    return `rgb(${r},${g},${b})`;
};

const makeCountSelector = (id, direction) => (s) => {
    const key = direction === 'in' ? 'target' : 'source';
    let count = 0;
    for (const e of s.edges) {
        if (e[key] === id) count += 1;
    }
    return count;
};

const SmartNode = ({ id, data, isConnectable, selected }) => {
    const incomingRaw = useStore(useCallback(makeCountSelector(id, 'in'), [id]));
    const outgoingRaw = useStore(useCallback(makeCountSelector(id, 'out'), [id]));

    const incomingCount = Math.max(1, incomingRaw);
    const outgoingCount = Math.max(1, outgoingRaw);
    const maxPorts = Math.max(incomingCount, outgoingCount);
    const dynamicWidth = Math.max(MIN_WIDTH, maxPorts * HANDLE_SPACING + HANDLE_PADDING);

    const getHandleLeft = (index, total) =>
        `${(100 / (total + 1)) * (index + 1)}%`;

    const color = data?.color || DEFAULT_BG;

    return (
        <div
            className={`smart-node ${selected ? 'is-selected' : ''}`}
            style={{
                width: `${dynamicWidth}px`,
                backgroundColor: color,
                borderColor: getBorderColor(color),
                color: getTextColor(color),
            }}
        >
            {Array.from({ length: incomingCount }).map((_, i) => (
                <Handle
                    key={`target-${i}`}
                    type="target"
                    position={Position.Top}
                    id={`t-${i}`}
                    isConnectable={isConnectable}
                    className="smart-node__handle smart-node__handle--top"
                    style={{ left: getHandleLeft(i, incomingCount) }}
                />
            ))}

            <div className="smart-node__label" title={data?.label || ''}>
                {data?.label || ''}
            </div>

            {Array.from({ length: outgoingCount }).map((_, i) => (
                <Handle
                    key={`source-${i}`}
                    type="source"
                    position={Position.Bottom}
                    id={`s-${i}`}
                    isConnectable={isConnectable}
                    className="smart-node__handle smart-node__handle--bottom"
                    style={{ left: getHandleLeft(i, outgoingCount) }}
                />
            ))}
        </div>
    );
};

const MemoizedSmartNode = memo(SmartNode);
MemoizedSmartNode.displayName = 'SmartNode';

export default MemoizedSmartNode;
