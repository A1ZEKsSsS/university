import React, { useCallback } from 'react';
import {
    useStore,
    getSmoothStepPath,
    BaseEdge,
    EdgeLabelRenderer
} from 'reactflow';

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
    const edges = useStore(useCallback((store) => store.edges, []));

    const siblings = edges.filter(e =>
        e.target === target &&
        e.targetHandle === (targetPosition || null)
    );

    if (siblings.length <= 1) {
        const [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition,
            targetX, targetY, targetPosition,
            borderRadius: 20,
        });
        return <EdgeWithLabel path={edgePath} label={label} lx={labelX} ly={labelY} style={style} markerEnd={markerEnd} />;
    }

    const sortedSiblings = siblings.sort((a, b) => a.source.localeCompare(b.source));
    const index = sortedSiblings.findIndex(e => e.id === id);

    const total = sortedSiblings.length;
    const offset = (index - (total - 1) / 2) * SHIFT;

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    if (targetPosition === 'top' || targetPosition === 'bottom') {
        finalTargetX += offset;
    }
    else {
        finalTargetY += offset;
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

    return <EdgeWithLabel path={edgePath} label={label} lx={labelX} ly={labelY} style={style} markerEnd={markerEnd} />;
}

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
                            zIndex: 100
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}