// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';

const Sidebar = ({ onCalculate, error, isLoading }) => {
    const navigate = useNavigate();
    const { auth } = useStore();

    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        if (auth.logout) auth.logout();
        navigate('/login');
    };

    return (
        <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>

            <button
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Свернуть" : "Развернуть"}
            >
                {isOpen ? '◀' : '▶'}
            </button>

            <div className="sidebar-content">

                <h2 className="sidebar-title">Управление</h2>

                <button className="btn history-btn" onClick={() => navigate('/history')}>
                    📜 История
                </button>

                <p className="description">
                    Двойной клик: добавить точку. <br />
                    Протянуть: создать связь.
                </p>

                <button
                    className="btn calc-btn"
                    onClick={onCalculate}
                    disabled={isLoading}
                >
                    {isLoading ? '...' : 'Рассчитать'}
                </button>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                <div className="spacer"></div>

                <hr className="divider" />

                <button className="btn logout-btn" onClick={handleLogout}>
                    Выйти
                </button>
            </div>
        </div>
    );
};

export default observer(Sidebar);