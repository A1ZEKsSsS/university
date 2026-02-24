import React, { useState } from 'react';

const MatrixInput = ({ nodes, setNodes, edges, setEdges }) => {
    const [viewType, setViewType] = useState('table');

    const findEdge = (source, target) => {
        return edges.find(e => e.source === source && e.target === target);
    };

    const getNextId = () => {
        const ids = nodes.map(n => parseInt(n.id, 10)).filter(n => !isNaN(n));
        const maxId = ids.length > 0 ? Math.max(...ids) : 0;
        return (maxId + 1).toString();
    };

    const handleAddNode = () => {
        const newId = getNextId();
        const newNode = {
            id: newId,
            type: 'default',
            data: { label: `T-${newId}` },
            position: { x: 100 + (nodes.length * 50), y: 100 + (nodes.length * 50) },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const handleRemoveNode = (nodeId) => {
        if (!window.confirm('Удалить точку и все её связи?')) return;
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    };

    const ARROW_CONFIG = {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#b1b1b7',
    };

    const handleBindChange = (source, target, currentEdge) => {

        let currentDir = 0;
        if (currentEdge) {
            currentDir = currentEdge.data?.directionCode || 1;
        }

        let nextDir = 0;
        if (currentDir === 0) nextDir = 1;
        else if (currentDir === 1) nextDir = 3;
        else if (currentDir === 3) nextDir = 2;
        else if (currentDir === 2) nextDir = 0;

        setEdges((eds) => {
            const filtered = eds.filter(e => !(e.source === source && e.target === target));

            if (nextDir === 0) return filtered;

            const isBiDir = nextDir === 1;
            const isForward = nextDir === 3;
            const isReverse = nextDir === 2;

            const newEdge = {
                id: `e${source}-${target}`,
                source,
                target,
                label: currentEdge?.label || '1',

                type: 'smoothstep',
                pathOptions: { borderRadius: 20 },

                sourceHandle: null,
                targetHandle: null,

                data: {
                    weight: currentEdge?.data?.weight || 1,
                    directionCode: nextDir
                },

                markerEnd: (isBiDir || isForward) ? ARROW_CONFIG : undefined,
                markerStart: (isBiDir || isReverse) ? ARROW_CONFIG : undefined,

                style: { strokeWidth: 2, stroke: '#b1b1b7', cursor: 'pointer' }
            };

            return [...filtered, newEdge];
        });
    };


    const handleWeightChange = (source, target, value) => {
        setEdges((eds) => {
            const edgeExists = eds.find(e => e.source === source && e.target === target);
            const numValue = value === '' ? 0 : parseInt(value, 10);

            if (edgeExists) {
                return eds.map(e => {
                    if (e.source === source && e.target === target) {
                        return {
                            ...e,
                            label: value.toString(),
                            data: { ...e.data, weight: numValue }
                        };
                    }
                    return e;
                });
            }
            return eds;
        });
    };

    const getBtnLabel = (edge) => {
        if (!edge) return <span style={{ opacity: 0.3 }}>•</span>;
        const code = edge.data?.directionCode;
        if (code === 1) return '↔';
        if (code === 3) return '→';
        if (code === 2) return '←';
        return '↔';
    };

    return (
        <div className="matrix-container">
            <div className="matrix-header-row">
                <div className="view-switcher">
                    <button
                        className={`switch-btn ${viewType === 'table' ? 'active' : ''}`}
                        onClick={() => setViewType('table')}
                    >
                        Таблицы
                    </button>
                    <button
                        className={`switch-btn ${viewType === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewType('cards')}
                    >
                        Карточки
                    </button>
                </div>

                <button className="matrix-add-btn" onClick={handleAddNode}>
                    + Точка
                </button>
            </div>

            {viewType === 'table' && (
                <div className="tables-wrapper">
                    <div className="matrix-card">
                        <h4>Связи</h4>
                        <div className="table-scroll-area">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        {nodes.map(n => (
                                            <th key={n.id}>
                                                {n.data.label}
                                                <button className="remove-node-btn" onClick={() => handleRemoveNode(n.id)}>&times;</button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.map(source => (
                                        <tr key={source.id}>
                                            <th>{source.data.label}</th>
                                            {nodes.map(target => {
                                                const isSelf = source.id === target.id;
                                                const edge = findEdge(source.id, target.id);
                                                return (
                                                    <td key={`${source.id}-${target.id}`} className={isSelf ? 'disabled-cell' : ''}>
                                                        {!isSelf && (
                                                            <button
                                                                onClick={() => handleBindChange(source.id, target.id, edge)}
                                                                className="topology-btn"
                                                            >
                                                                {getBtnLabel(edge)}
                                                            </button>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="matrix-card">
                        <h4>Веса</h4>
                        <div className="table-scroll-area">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        {nodes.map(n => <th key={n.id}>{n.data.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.map(source => (
                                        <tr key={source.id}>
                                            <th>{source.data.label}</th>
                                            {nodes.map(target => {
                                                const isSelf = source.id === target.id;
                                                const edge = findEdge(source.id, target.id);
                                                const isDisabled = !edge || isSelf;

                                                return (
                                                    <td key={`${source.id}-${target.id}`} className={isSelf ? 'disabled-cell' : ''}>
                                                        {!isSelf && (
                                                            <input
                                                                type="number"
                                                                className="weight-input-table"
                                                                value={edge ? (edge.label || '') : ''}
                                                                disabled={!edge}
                                                                onChange={(e) => handleWeightChange(source.id, target.id, e.target.value)}
                                                                placeholder={edge ? "0" : ""}
                                                            />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {viewType === 'cards' && (
                <div className="cards-grid">
                    {nodes.map(source => (
                        <div key={source.id} className="mobile-card">
                            <div className="mobile-card-header">
                                <span>От: <b>{source.data.label}</b></span>
                                <button className="remove-node-btn" onClick={() => handleRemoveNode(source.id)}>&times;</button>
                            </div>

                            <div className="mobile-connections">
                                {nodes.filter(n => n.id !== source.id).map(target => {
                                    const edge = findEdge(source.id, target.id);
                                    const isActive = !!edge;

                                    return (
                                        <div key={target.id} className={`mobile-row ${isActive ? 'active' : ''}`}>
                                            <span className="target-label">к {target.data.label}</span>

                                            <div className="mobile-controls">
                                                <button
                                                    onClick={() => handleBindChange(source.id, target.id, edge)}
                                                    className={`topology-btn mobile ${isActive ? 'active' : ''}`}
                                                >
                                                    {getBtnLabel(edge)}
                                                </button>

                                                <input
                                                    type="number"
                                                    className="weight-input-mobile"
                                                    disabled={!isActive}
                                                    value={edge ? (edge.label || '') : ''}
                                                    onChange={(e) => handleWeightChange(source.id, target.id, e.target.value)}
                                                    placeholder="Вес"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatrixInput;