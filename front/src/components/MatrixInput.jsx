import React from 'react';

const MatrixInput = ({ nodes, setNodes, edges, setEdges }) => {

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
            data: { label: `T-${newId}` }, // Сократил название для компактности
            position: { x: 100 + (nodes.length * 50), y: 100 + (nodes.length * 50) },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const handleRemoveNode = (nodeId) => {
        if (!window.confirm('Удалить точку и все её связи?')) return;
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    };

    const handleBindChange = (source, target, isChecked) => {
        if (isChecked) {
            const newEdge = {
                id: `e${source}-${target}`,
                source,
                target,
                label: '1',
                type: 'smoothstep',
                markerEnd: { type: 'arrowclosed' },
            };
            setEdges((eds) => [...eds, newEdge]);
        } else {
            setEdges((eds) => eds.filter(e => !(e.source === source && e.target === target)));
        }
    };

    const handleWeightChange = (source, target, value) => {
        if (value === '') return;

        setEdges((eds) => {
            const edgeExists = eds.find(e => e.source === source && e.target === target);
            const numValue = parseInt(value, 10); // Преобразуем строку в число

            if (edgeExists) {
                return eds.map(e => {
                    if (e.source === source && e.target === target) {
                        return {
                            ...e,
                            label: value.toString(), // Для отображения на графе
                            data: { ...e.data, weight: numValue } // <--- ВАЖНО: Для логики расчетов
                        };
                    }
                    return e;
                });
            } else {
                return [...eds, {
                    id: `e${source}-${target}`,
                    source,
                    target,
                    label: value.toString(),
                    type: 'smoothstep',
                    markerEnd: { type: 'arrowclosed' },
                    data: { weight: numValue } // <--- ВАЖНО: Создаем с данными
                }];
            }
        });
    };

    return (
        <div className="matrix-container">

            <div className="matrix-controls">
                <h3>Редактор матриц</h3>
                <button className="matrix-add-btn" onClick={handleAddNode}>
                    + Добавить точку
                </button>
            </div>

            <div className="tables-wrapper">

                {/* === Таблица 1: Матрица Связей === */}
                <div className="matrix-card">
                    <h4>Связи (Топология)</h4>
                    <div className="table-scroll-area">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    {nodes.map(n => (
                                        <th key={n.id}>
                                            {n.data.label}
                                            <button
                                                className="remove-node-btn"
                                                onClick={() => handleRemoveNode(n.id)}
                                                title="Удалить точку"
                                            >&times;</button>
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
                                                        <input
                                                            type="checkbox"
                                                            checked={!!edge}
                                                            onChange={(e) => handleBindChange(source.id, target.id, e.target.checked)}
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

                {/* === Таблица 2: Матрица Весов === */}
                <div className="matrix-card">
                    <h4>Веса (Стоимость)</h4>
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
                                                <td key={`${source.id}-${target.id}`} className={isSelf ? 'disabled-cell' : ''} style={{ background: isDisabled && !isSelf ? '#fdfdfd' : '' }}>
                                                    {!isSelf && (
                                                        <input
                                                            type="number"
                                                            value={edge ? (edge.label || '') : ''}
                                                            disabled={!edge}
                                                            onChange={(e) => handleWeightChange(source.id, target.id, e.target.value)}
                                                            placeholder={edge ? "0" : ""}
                                                            style={{ opacity: isDisabled ? 0.3 : 1 }}
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

            <p style={{ color: '#868e96', fontSize: '0.85em', marginTop: '10px' }}>
                * Совет: Используйте <b>Shift + Колесико мыши</b> для горизонтальной прокрутки, если таблица не влазит.
            </p>
        </div>
    );
};

export default MatrixInput;