import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import IconClose from './img/close.png';
import IconMenu from './img/menu.png';
import { MarkerType } from 'reactflow';

const Sidebar = ({ onCalculate, error, isLoading, edgeMenu, onDirectionChange, onDeleteEdge, onWeightChange, onOpenSaveModal, onOpenLoadModal }) => {
    const navigate = useNavigate();
    const { auth } = useStore();

    const [localWeight, setLocalWeight] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        if (auth.unauthorize) auth.unauthorize();
        navigate('/login');
    };

    useEffect(() => {
        if (edgeMenu) {
            setLocalWeight(edgeMenu.weight);
        }
    }, [edgeMenu]);
    // const handleDirectionChange = (directionCode) => {
    //     if (!edgeMenu) return;

    //     const isBiDir = directionCode === 1;
    //     const isForward = directionCode === 3;
    //     const isReverse = directionCode === 2;

    //     const ARROW_END = {
    //         type: MarkerType.ArrowClosed,
    //         width: 20,
    //         height: 20,
    //         color: '#b1b1b7',
    //     };

    //     const ARROW_START = {
    //         type: MarkerType.ArrowClosed,
    //         width: 20,
    //         height: 20,
    //         color: '#b1b1b7',
    //         orient: 'auto-start-reverse',
    //     };

    //     setEdges((eds) => eds.map((e) => {
    //         if (e.id !== edgeMenu.edgeId) return e;
    //         return {
    //             ...e,
    //             data: { ...e.data, directionCode },
    //             markerEnd: (isBiDir || isForward) ? ARROW_END : undefined,
    //             markerStart: (isBiDir || isReverse) ? ARROW_START : undefined,
    //         };
    //     }));

    //     setEdgeMenu(null);
    // };

    // const handleDeleteEdge = () => {
    //     if (!edgeMenu) return;
    //     setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.edgeId));
    //     setEdgeMenu(null);
    // };

    return (
        <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>

            <button
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "Згорнути" : "Розгорнути"}
            >
                {isOpen ? <img src={IconClose} alt="Close" className="icon-close" /> : <img src={IconMenu} alt="Menu" className="icon-menu" />}
            </button>

            <div className="sidebar-content">

                <h2 className="sidebar-title">Управління</h2>

                <p className="description">
                    Двічі клацніть: додати точку. <br />
                    Потягніть: створити зв'язок.
                </p>

                {edgeMenu && (
                    <div className="sidebar-edge-settings fade-in">
                        <h4 className="settings-title">Налаштування зв'язку</h4>

                        <div className="settings-actions">
                            <button className="settings-btn" onClick={() => onDirectionChange(1)}>
                                <span className="btn-icon">↔️</span> Двостороння
                            </button>
                            <button className="settings-btn" onClick={() => onDirectionChange(3)}>
                                <span className="btn-icon">→</span> Вперед
                            </button>
                            <button className="settings-btn" onClick={() => onDirectionChange(2)}>
                                <span className="btn-icon">←</span> Назад
                            </button>

                            <div className="settings-divider"></div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 0' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ВАГА (ВІДСТАНЬ):</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="number"
                                        value={localWeight}
                                        onChange={(e) => setLocalWeight(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={() => onWeightChange(localWeight)}
                                        style={{
                                            padding: '8px 12px',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                        title="Зберегти вагу"
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>

                            <div className="settings-divider"></div>

                            <button className="settings-btn delete-btn" onClick={onDeleteEdge}>
                                <span className="btn-icon">🗑️</span> Видалити
                            </button>
                        </div>
                    </div>
                )}

                <button
                    className="btn calc-btn"
                    onClick={onCalculate}
                    disabled={isLoading}
                >
                    {isLoading ? '...' : 'Розрахувати'}
                </button>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                <div className="spacer"></div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button className="btn history-btn" style={{ flex: 1, margin: 0 }} onClick={onOpenSaveModal}>
                        💾 Зберегти
                    </button>
                    <button className="btn history-btn" style={{ flex: 1, margin: 0 }} onClick={onOpenLoadModal}>
                        📂 Відкрити
                    </button>
                </div>

                <hr className="divider" />

                <button className="btn logout-btn" onClick={handleLogout}>
                    Вийти
                </button>
            </div>
        </div>
    );
};

export default observer(Sidebar);