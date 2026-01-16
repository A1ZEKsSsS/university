// src/components/Sidebar.jsx
import React from 'react';

const Sidebar = ({ onCalculate, error, isLoading }) => {
    return (
        <div className="sidebar" style={{ width: '250px', padding: '20px', background: '#f5f5f5' }}>
            <h2>Управление</h2>
            <p style={{ fontSize: '14px', color: '#555' }}>
                Двойной клик по полю: добавить точку. <br />
                Протянуть линию: создать связь.
            </p>

            <button
                onClick={onCalculate}
                disabled={isLoading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    width: '100%'
                }}
            >
                {isLoading ? 'Считаем...' : 'Рассчитать'}
            </button>

            {error && (
                <div style={{ color: 'red', marginTop: '15px', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default Sidebar;