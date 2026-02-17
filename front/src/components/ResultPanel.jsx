import React from 'react';

const ResultPanel = ({ result, onCellClick }) => {
    // Проверка: есть ли данные и есть ли матрица расстояний (dist)
    // Раньше result был просто матрицей, теперь это объект { dist, paths }
    // Поддержим оба варианта на всякий случай
    const distMatrix = result?.dist || (Array.isArray(result) ? result : null);

    if (!distMatrix) return null;

    const size = distMatrix.length;
    const headers = Array.from({ length: size }, (_, i) => i + 1);

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
                * Кликните на ячейку с числом, чтобы увидеть маршрут на графе.
            </p>

            <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #dee2e6' }}>From \ To</th>
                        {headers.map(h => (
                            <th key={h} style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #dee2e6' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {distMatrix.map((row, i) => (
                        <tr key={i}>
                            {/* Заголовок ряда */}
                            <td style={{ fontWeight: 'bold', background: '#f8f9fa', border: '1px solid #dee2e6' }}>{i + 1}</td>

                            {/* Ячейки */}
                            {row.map((val, j) => {
                                const isInf = val > 1000000; // Проверка на "бесконечность"
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
                                        // Добавляем hover эффект через inline-события для простоты
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