import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { observer } from 'mobx-react-lite';
import IconClose from './img/close.png';
import IconMenu from './img/menu.png';

// ─── Утиліти кольору ───────────────────────────────────────────

const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    if (h.length !== 6) return { r: 255, g: 255, b: 255 };
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
};

const rgbToHex = (r, g, b) => {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const isValidHex = (hex) => /^#[0-9a-fA-F]{6}$/.test(hex);

const PRESET_COLORS = [
    '#ffffff', '#f1f5f9', '#fef9c3', '#fee2e2',
    '#dcfce7', '#dbeafe', '#ede9fe', '#fce7f3',
    '#0f172a', '#1e40af', '#15803d', '#b91c1c',
];

// ─── Компонент повзунка ────────────────────────────────────────

const ColorSlider = ({ label, value, min = 0, max = 255, color, onChange }) => (
    <div className="color-slider">
        <div className="color-slider__header">
            <span className="color-slider__label">{label}</span>
            <span className="color-slider__value">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="color-slider__input"
            style={{ '--slider-color': color }}
        />
    </div>
);

// ─── Головний компонент ────────────────────────────────────────

const Sidebar = ({
    onCalculate,
    error,
    isLoading,
    edgeMenu,
    onDirectionChange,
    onDeleteEdge,
    onWeightChange,
    onOpenSaveModal,
    onOpenLoadModal,
    // Нові пропси для кольору вузла:
    selectedNode,       // { id, data } | null
    onNodeColorChange,  // (nodeId, color) => void
}) => {
    const navigate = useNavigate();
    const { auth } = useStore();

    const [localWeight, setLocalWeight] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    // RGB стейт для повзунків
    const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });
    // HEX в текстовому полі (може бути неповним поки юзер друкує)
    const [hexInput, setHexInput] = useState('#ffffff');

    // Коли змінився виділений вузол — оновлюємо picker
    useEffect(() => {
        const color = selectedNode?.data?.color || '#ffffff';
        setRgb(hexToRgb(color));
        setHexInput(color);
    }, [selectedNode]);

    // Коли змінився edgeMenu — оновлюємо вагу
    useEffect(() => {
        if (edgeMenu) setLocalWeight(edgeMenu.weight);
    }, [edgeMenu]);

    const handleLogout = () => {
        if (auth.unauthorize) auth.unauthorize();
        navigate('/login');
    };

    // ─── Обробники кольору ──────────────────────────────────────

    const applyColor = useCallback((hex) => {
        if (!selectedNode || !isValidHex(hex)) return;
        onNodeColorChange(selectedNode.id, hex);
    }, [selectedNode, onNodeColorChange]);

    const handleSliderChange = useCallback((channel, value) => {
        const newRgb = { ...rgb, [channel]: value };
        setRgb(newRgb);
        const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setHexInput(hex);
        applyColor(hex);
    }, [rgb, applyColor]);

    const handleHexInput = (e) => {
        const val = e.target.value;
        setHexInput(val);
        if (isValidHex(val)) {
            const newRgb = hexToRgb(val);
            setRgb(newRgb);
            applyColor(val);
        }
    };

    const handlePreset = (color) => {
        setHexInput(color);
        setRgb(hexToRgb(color));
        applyColor(color);
    };

    const currentColor = rgbToHex(rgb.r, rgb.g, rgb.b);

    return (
        <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>

            <button
                className="sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Згорнути' : 'Розгорнути'}
            >
                {isOpen
                    ? <img src={IconClose} alt="Close" className="icon-close" />
                    : <img src={IconMenu} alt="Menu" className="icon-menu" />
                }
            </button>

            <div className="sidebar-content">
                <h2 className="sidebar-title">Управління</h2>

                <p className="description">
                    Двічі клацніть: додати точку.<br />
                    Потягніть: створити зв'язок.
                </p>

                {/* ── Колір вузла ── */}
                {selectedNode && (
                    <div className="sidebar-section fade-in">
                        <h4 className="settings-title">
                            Колір вузла
                            <span className="settings-node-name">
                                {selectedNode.data?.label || selectedNode.id}
                            </span>
                        </h4>

                        {/* Превʼю + HEX */}
                        <div className="color-preview-row">
                            <div
                                className="color-preview-swatch"
                                style={{ backgroundColor: currentColor }}
                            />
                            <input
                                type="text"
                                value={hexInput}
                                onChange={handleHexInput}
                                className="color-hex-input"
                                placeholder="#ffffff"
                                maxLength={7}
                                spellCheck={false}
                            />
                        </div>

                        {/* Повзунки RGB */}
                        <div className="color-sliders">
                            <ColorSlider
                                label="R"
                                value={rgb.r}
                                color={`rgb(${rgb.r}, 0, 0)`}
                                onChange={(v) => handleSliderChange('r', v)}
                            />
                            <ColorSlider
                                label="G"
                                value={rgb.g}
                                color={`rgb(0, ${rgb.g}, 0)`}
                                onChange={(v) => handleSliderChange('g', v)}
                            />
                            <ColorSlider
                                label="B"
                                value={rgb.b}
                                color={`rgb(0, 0, ${rgb.b})`}
                                onChange={(v) => handleSliderChange('b', v)}
                            />
                        </div>

                        {/* Пресети */}
                        <div className="color-presets">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    className={`color-preset ${currentColor === c ? 'is-active' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => handlePreset(c)}
                                    title={c}
                                />
                            ))}
                        </div>

                        {/* Скинути */}
                        <button
                            className="color-reset-btn"
                            onClick={() => handlePreset('#ffffff')}
                        >
                            Скинути колір
                        </button>
                    </div>
                )}

                {/* ── Налаштування ребра ── */}
                {edgeMenu && (
                    <div className="sidebar-section fade-in">
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

                            <div className="settings-divider" />

                            <div className="weight-control-group">
                                <label>ВАГА (ВІДСТАНЬ):</label>
                                <div className="weight-input-wrapper">
                                    <input
                                        type="number"
                                        min="0"
                                        value={localWeight}
                                        onChange={(e) => setLocalWeight(e.target.value)}
                                        className="weight-input"
                                    />
                                    <button
                                        onClick={() => onWeightChange(localWeight)}
                                        className="weight-save-btn"
                                        title="Зберегти вагу"
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>

                            <div className="settings-divider" />

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

                {error && <div className="error-box">{error}</div>}

                <div className="spacer" />

                <div className="sidebar-save-row">
                    <button className="btn history-btn" onClick={onOpenSaveModal}>
                        💾 Зберегти
                    </button>
                    <button className="btn history-btn" onClick={onOpenLoadModal}>
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
