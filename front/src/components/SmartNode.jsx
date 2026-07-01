import React, { memo, useCallback } from 'react';
import { Handle, Position, useStore } from 'reactflow';
// import './SmartNode.css';

const MIN_WIDTH = 100;
const HANDLE_SPACING = 20;
const HANDLE_PADDING = 40;

// Селектор повертає число, тому React порівнює по === і не перерендерює вузол
// при змінах, які його не стосуються (зокрема при драгу згину іншого ребра).
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

    // Мінімум один handle кожного типу, щоб до вузла можна було підключитися,
    // навіть якщо він ще без зв'язків.
    const incomingCount = Math.max(1, incomingRaw);
    const outgoingCount = Math.max(1, outgoingRaw);

    const maxPorts = Math.max(incomingCount, outgoingCount);
    const dynamicWidth = Math.max(MIN_WIDTH, maxPorts * HANDLE_SPACING + HANDLE_PADDING);

    const getHandleLeft = (index, total) => `${(100 / (total + 1)) * (index + 1)}%`;

    return (
        <div
            className={`smart-node ${selected ? 'is-selected' : ''}`}
            style={{ width: `${dynamicWidth}px` }}
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
