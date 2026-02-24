// components/SmartEdge.jsx
import React, { useCallback } from 'react';
import {
    useStore,
    getSmoothStepPath,
    BaseEdge,
    EdgeLabelRenderer,
    Position
} from 'reactflow';

const EDGE_SPACING = 20;

function SmartEdge({ id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, label }) {

    const edges = useStore(useCallback((s) => s.edges, []));

    const targetEdges = edges.filter(e =>
        e.target === target &&
        e.source !== source
    );

    targetEdges.sort((a, b) => a.source.localeCompare(b.source));

    const index = targetEdges.findIndex(e => e.id === id);

    const total = targetEdges.length;

    let shift = 0;
    if (total > 1 && index !== -1) {
        shift = (index - (total - 1) / 2) * EDGE_SPACING;
    }

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (targetPosition === Position.Top || targetPosition === Position.Bottom) {
        finalTargetX += shift;
    } else {
        finalTargetY += shift;
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