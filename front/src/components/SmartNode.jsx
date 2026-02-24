import React, { memo, useMemo } from 'react';
import { Handle, Position, useStore } from 'reactflow';


const MIN_WIDTH = 100;

const HANDLE_SPACING = 20;

const SmartNode = ({ id, data, isConnectable }) => {
    const edges = useStore((s) => s.edges);

    const { incoming, outgoing } = useMemo(() => {
        return {
            incoming: edges.filter((e) => e.target === id),
            outgoing: edges.filter((e) => e.source === id),
        };
    }, [edges, id]);

    const incomingCount = Math.max(1, incoming.length);
    const outgoingCount = Math.max(1, outgoing.length);

    const maxPorts = Math.max(incomingCount, outgoingCount);

    const dynamicWidth = Math.max(MIN_WIDTH, maxPorts * HANDLE_SPACING + 40);

    const getHandleLeft = (index, total) => {
        return `${(100 / (total + 1)) * (index + 1)}%`;
    };

    return (
        <div
            className="smart-node"
            style={{
                background: '#fff',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px 0',
                width: `${dynamicWidth}px`,
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                transition: 'width 0.2s ease',
            }}
        >
            {Array.from({ length: incomingCount }).map((_, i) => (
                <Handle
                    key={`target-${i}`}
                    type="target"
                    position={Position.Top}
                    id={`t-${i}`}
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

            <div style={{ padding: '0 10px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.label}
            </div>

            {Array.from({ length: outgoingCount }).map((_, i) => (
                <Handle
                    key={`source-${i}`}
                    type="source"
                    position={Position.Bottom}
                    id={`s-${i}`}
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