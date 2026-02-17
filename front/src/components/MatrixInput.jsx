import React, { useState } from 'react';
// import './MatrixInput.css';

const MatrixInput = ({ nodes, setNodes, edges, setEdges }) => {
    // Состояние переключателя: 'table' (Твой вариант) или 'cards' (Для телефона)
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

    // ТВОЯ ФУНКЦИЯ (Без изменений)
    const handleBindChange = (source, target, currentEdge) => {
        let nextType = 0;
        let currentType = 0;

        if (currentEdge) {
            currentType = currentEdge.data?.directionCode || 1;
        }

        if (currentType === 0) nextType = 1;
        else if (currentType === 1) nextType = 3;
        else if (currentType === 3) nextType = 2;
        else if (currentType === 2) nextType = 0;

        setEdges((eds) => {
            const filtered = eds.filter(e => !(e.source === source && e.target === target));
            if (nextType === 0) return filtered;

            const isBiDir = nextType === 1;
            const isForward = nextType === 3;
            const isReverse = nextType === 2;

            const newEdge = {
                id: `e${source}-${target}`,
                source,
                target,
                label: currentEdge?.label || '1',
                // type: 'smoothstep',
                type: 'smart',
                pathOptions: { borderRadius: 20 }, // Добавил для красоты линий
                data: {
                    weight: currentEdge?.data?.weight || 1,
                    directionCode: nextType
                },
                markerEnd: (isBiDir || isForward) ? { type: 'arrowclosed' } : undefined,
                markerStart: (isBiDir || isReverse) ? { type: 'arrowclosed' } : undefined,
            };

            return [...filtered, newEdge];
        });
    };

    // ТВОЯ ФУНКЦИЯ (Без изменений)
    const handleWeightChange = (source, target, value) => {
        // Разрешаем пустую строку для стирания, но не сохраняем её как NaN
        if (value === '') {
            // Можно просто обновить label на пустоту, но не трогать вес пока
        }

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
            // Если ребра нет, мы его не создаем через input веса (только через кнопку типа)
            return eds;
        });
    };

    // Хелпер для иконок кнопок
    const getBtnLabel = (edge) => {
        if (!edge) return <span style={{ opacity: 0.3 }}>•</span>;
        const code = edge.data?.directionCode;
        if (code === 1) return '↔';
        if (code === 3) return '→';
        if (code === 2) return '←';
        return '↔'; // fallback
    };

    return (
        <div className="matrix-container">
            {/* === ШАПКА С ПЕРЕКЛЮЧАТЕЛЕМ === */}
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

            {/* === ВАРИАНТ 1: ТВОИ ТАБЛИЦЫ (LEGACY) === */}
            {viewType === 'table' && (
                <div className="tables-wrapper">
                    {/* Таблица 1: Топология */}
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

                    {/* Таблица 2: Веса */}
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

            {/* === ВАРИАНТ 2: КАРТОЧКИ (ДЛЯ ТЕЛЕФОНА) === */}
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
                                                {/* Кнопка типа связи (та же логика) */}
                                                <button
                                                    onClick={() => handleBindChange(source.id, target.id, edge)}
                                                    className={`topology-btn mobile ${isActive ? 'active' : ''}`}
                                                >
                                                    {getBtnLabel(edge)}
                                                </button>

                                                {/* Инпут веса (та же логика) */}
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