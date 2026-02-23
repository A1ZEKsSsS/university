import React, { useCallback } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useStore
} from 'reactflow';

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

    const edges = useStore(useCallback((store) => store.edges, []));
    const nodes = useStore(useCallback((store) => store.nodeInternals, []));

    const siblings = edges.filter(e =>
        e.target === target &&
        e.targetHandle === targetPosition
    );

    const sortedSiblings = siblings.sort((a, b) => {
        const nodeA = nodes.get(a.source);
        const nodeB = nodes.get(b.source);
        if (!nodeA || !nodeB) return 0;


        if (targetPosition === 'top' || targetPosition === 'bottom') {
            return nodeA.position.x - nodeB.position.x;
        }

        return nodeA.position.y - nodeB.position.y;
    });

    const index = sortedSiblings.findIndex(e => e.id === id);
    const total = sortedSiblings.length;


    let offset = 0;
    if (index !== -1 && total > 1) {
        offset = (index - (total - 1) / 2) * GAP;
    }

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (targetPosition === 'left' || targetPosition === 'right') {
        finalTargetY += offset;
    } else {
        finalTargetX += offset;
    }

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
                            pointerEvents: 'all',
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}