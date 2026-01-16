// src/components/ResultPanel.jsx
import React from 'react';

const ResultPanel = ({ result }) => {
    if (!result) return null;

    return (
        <div className="result-matrix-container" style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            background: 'white',
            padding: '20px',
            border: '1px solid black',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxHeight: '300px',
            overflow: 'auto'
        }}>
            <h3>Результат расчета</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
    );
};

export default ResultPanel;