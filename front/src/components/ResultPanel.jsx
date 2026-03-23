import React from 'react';

const ResultPanel = ({ result, onCellClick, nodes }) => {

    const distMatrix = result?.dist || (Array.isArray(result) ? result : null);

    if (!distMatrix) return null;

    const size = distMatrix.length;
    const headers = Array.from({ length: size }, (_, i) => i);

    const getNodeName = (index) => {
        if (!nodes || !nodes[index]) return `Точка ${index + 1}`;
        return nodes[index].data?.label || `Точка ${index + 1}`;
    };

    return (
        <div style={{
            height: '35%',
            minHeight: '200px',
            borderTop: '2px solid #ddd',
            padding: '20px',
            background: 'white',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Матрица кратчайших путей</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 0 }}>
                * Клацніть на комірку з числом, щоб побачити маршрут на графі.
            </p>

            <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #dee2e6', color: '#000' }}>Вiд \ До</th>
                        {headers.map(i => (
                            <th key={i} style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #dee2e6', color: '#000' }}>
                                {getNodeName(i)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {distMatrix.map((row, i) => (
                        <tr key={i}>
                            <td style={{ fontWeight: 'bold', background: '#f8f9fa', border: '1px solid #dee2e6', color: '#000' }}>
                                {getNodeName(i)}
                            </td>

                            {row.map((val, j) => {
                                const isInf = val > 1000000;
                                const isDiagonal = i === j;

                                return (
                                    <td
                                        key={`${i}-${j}`}
                                        onClick={() => !isInf && !isDiagonal && onCellClick && onCellClick(i, j)}
                                        style={{
                                            border: '1px solid #dee2e6',
                                            padding: '8px',
                                            cursor: (isInf || isDiagonal) ? 'default' : 'pointer',
                                            backgroundColor: isDiagonal ? '#f1f3f5' : 'white',
                                            color: isInf ? '#adb5bd' : '#000',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => { if (!isInf && !isDiagonal) e.target.style.background = '#e7f5ff'; }}
                                        onMouseLeave={(e) => { if (!isInf && !isDiagonal) e.target.style.background = 'white'; }}
                                    >
                                        {isInf ? '∞' : val}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ResultPanel;