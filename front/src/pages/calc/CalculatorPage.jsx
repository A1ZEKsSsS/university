import React, { useState, useEffect } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import FlowBoard from '../../components/FlowBoard';
import Sidebar from '../../components/SideBar';
import ResultPanel from '../../components/ResultPanel';
import MatrixInput from '../../components/MatrixInput';
import { generateMatrices } from '../../utils/MatrixHelpres';
import { getLayoutedElements } from '../../utils/autoLayout';
import axios from 'axios';
// import './CalculatorPage.css';

const initialNodes = [
    { id: '1', type: 'default', data: { label: 'Точка 1' }, position: { x: 100, y: 100 } },
];

const PATH_COLORS = [
    '#ff0072',
    '#00d2ff',
    '#00ff48',
    '#ff9f00',
    '#9d00ff',
    '#ffea00',
];

const DEFAULT_EDGE_COLOR = '#b1b1b7';
const DIMMED_EDGE_COLOR = '#e5e5ea';

const buildArrowConfig = (color = DEFAULT_EDGE_COLOR, reverse = false) => ({
    type: 'arrowclosed',
    width: 20,
    height: 20,
    color,
    ...(reverse ? { orient: 'auto-start-reverse' } : {}),
});

const ARROW_CONFIG = buildArrowConfig();

const CalculatorContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [viewMode, setViewMode] = useState('visual');
    const [resultData, setResultData] = useState(null);
    const [highlightedPaths, setHighlightedPaths] = useState([]);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [edgeMenu, setEdgeMenu] = useState(null);

    const [savedGraphs, setSavedGraphs] = useState([]);
    const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
    const [graphModalMode, setGraphModalMode] = useState('load');
    const [graphNameInput, setGraphNameInput] = useState('');
    const [modalError, setModalError] = useState('');

    // --- Підсвічування маршрутів ---
    // Фіксовано: setEdges прибрано з deps, збережено selected/zIndex.
    // Додано: при виділених маршрутах всі інші ребра стають напівпрозорими.
    useEffect(() => {
        const hasHighlight = highlightedPaths.length > 0;

        setEdges((eds) =>
            eds.map((edge) => {
                let strokeColor = DEFAULT_EDGE_COLOR;
                let strokeWidth = 2;
                let strokeOpacity = 1;
                let isAnimated = false;
                let zIndex = edge.selected ? 100 : 0;
                let fontWeight = 'normal';
                let labelOpacity = 1;

                let belongsToAnyPath = false;

                if (hasHighlight) {
                    for (let pathIdx = 0; pathIdx < highlightedPaths.length; pathIdx++) {
                        const path = highlightedPaths[pathIdx];

                        for (let i = 0; i < path.length - 1; i++) {
                            const u = path[i];
                            const v = path[i + 1];
                            if (
                                (edge.source === u && edge.target === v) ||
                                (edge.source === v && edge.target === u)
                            ) {
                                strokeColor = PATH_COLORS[pathIdx % PATH_COLORS.length];
                                strokeWidth = 4;
                                isAnimated = true;
                                zIndex = 1000;
                                fontWeight = 'bold';
                                belongsToAnyPath = true;
                                break;
                            }
                        }
                        if (belongsToAnyPath) break;
                    }

                    // Ребра не на маршруті — напівпрозорі
                    if (!belongsToAnyPath) {
                        strokeColor = DIMMED_EDGE_COLOR;
                        strokeOpacity = 0.4;
                        labelOpacity = 0.35;
                    }
                }

                const dirCode = edge.data?.directionCode || 1;
                const isBiDir = dirCode === 1;
                const isForward = dirCode === 3;
                const isReverse = dirCode === 2;

                return {
                    ...edge,
                    type: edge.type || 'bendable',
                    pathOptions: { borderRadius: 20 },
                    interactionWidth: 25,

                    markerEnd: isBiDir || isForward ? buildArrowConfig(strokeColor) : undefined,
                    markerStart: isBiDir || isReverse ? buildArrowConfig(strokeColor, true) : undefined,

                    style: {
                        ...edge.style,
                        stroke: strokeColor,
                        strokeWidth,
                        strokeOpacity,
                        cursor: 'pointer',
                    },
                    animated: isAnimated,
                    zIndex,

                    labelStyle: {
                        ...edge.labelStyle,
                        fill: strokeColor === DEFAULT_EDGE_COLOR || strokeColor === DIMMED_EDGE_COLOR ? '#000' : strokeColor,
                        fontWeight,
                        fontSize: 12,
                        opacity: labelOpacity,
                    },
                    labelShowBg: true,
                    labelBgStyle: {
                        fill: '#ffffff',
                        fillOpacity: 0.9 * labelOpacity,
                        stroke: '#dee2e6',
                        strokeWidth: 1,
                    },
                    labelBgPadding: [6, 4],
                    labelBgBorderRadius: 6,
                };
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightedPaths]);

    // --- Авто-лейаут ---

    const handleAutoLayout = (direction = 'TB') => {
        if (nodes.length === 0) return;
        const layouted = getLayoutedElements(nodes, edges, { direction });
        setNodes(layouted.nodes);
        // Примітка: ручні згини ребер лишаються, але оскільки вузли переїхали,
        // можна вважати за розумне — скидати їх. Зробимо це.
        setEdges((eds) =>
            eds.map((e) => ({
                ...e,
                data: { ...e.data, offsetX: 0, offsetY: 0 },
            }))
        );
    };

    // --- Модалки ---

    const openSaveModal = () => {
        setGraphModalMode('save');
        setGraphNameInput('');
        setModalError('');
        setIsGraphModalOpen(true);
    };

    const openLoadModal = async () => {
        setGraphModalMode('load');
        setModalError('');
        setIsGraphModalOpen(true);
        setIsLoading(true);
        try {
            const response = await axios.get('/api/graphs');
            setSavedGraphs(response.data);
        } catch (err) {
            console.error(err);
            setModalError('Не вдалося завантажити список графів.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitSaveGraph = async () => {
        if (!graphNameInput.trim()) return;
        setIsLoading(true);
        setModalError('');
        try {
            await axios.post('/api/graphs/create', {
                name: graphNameInput,
                nodes,
                edges,
                resultData,
            });
            setIsGraphModalOpen(false);
        } catch (err) {
            console.error(err);
            setModalError(err.response?.data?.error || 'Не вдалося зберегти граф.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadGraph = async (id) => {
        setIsLoading(true);
        setModalError('');
        try {
            const response = await axios.get(`/api/graphs/${id}`);
            const graph = response.data;
            setNodes(graph.nodes || []);

            const restoredEdges = (graph.edges || []).map((edge) => {
                const dirCode = edge.data?.directionCode || 1;
                const isBiDir = dirCode === 1;
                const isForward = dirCode === 3;
                const isReverse = dirCode === 2;

                return {
                    ...edge,
                    markerEnd: isBiDir || isForward ? buildArrowConfig() : undefined,
                    markerStart: isBiDir || isReverse ? buildArrowConfig(DEFAULT_EDGE_COLOR, true) : undefined,
                };
            });

            setEdges(restoredEdges);
            setResultData(graph.resultData || null);
            setHighlightedPaths([]);
            setIsGraphModalOpen(false);
        } catch (err) {
            console.error(err);
            setModalError('Не вдалося завантажити граф.');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteGraph = async (id) => {
        if (!window.confirm('Видалити цей граф назавжди?')) return;
        try {
            await axios.delete(`/api/graphs/${id}`);
            setSavedGraphs((prev) => prev.filter((g) => g._id !== id));
        } catch (err) {
            console.error(err);
            setModalError('Не вдалося видалити граф.');
        }
    };

    // --- Розрахунок ---

    const handleCalculate = async () => {
        setError(null);
        setResultData(null);
        setHighlightedPaths([]);
        setIsLoading(true);

        try {
            const { bind, weight, totalNodes } = generateMatrices(nodes, edges);

            const response = await axios.post('/api/calculate/calculate', {
                bind,
                weight,
                totalNodes,
            });

            setResultData(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Невідома помилка');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Робота з ребрами ---

    const handleEdgeClick = (event, edge) => {
        event.stopPropagation();

        setEdgeMenu({
            edgeId: edge.id,
            weight: edge.data?.weight ?? parseInt(edge.label, 10) ?? 0,
        });

        setEdges((eds) =>
            eds.map((e) => {
                if (e.id !== edge.id) return { ...e, selected: false, zIndex: 0 };
                return { ...e, selected: true, zIndex: 100, type: 'bendable' };
            })
        );
    };

    const handleEdgeWeightChange = (newWeight) => {
        if (!edgeMenu) return;

        const weightNum = parseInt(newWeight, 10);
        if (Number.isNaN(weightNum) || weightNum < 0) return;

        setEdges((eds) =>
            eds.map((e) => {
                if (e.id !== edgeMenu.edgeId) return e;
                return {
                    ...e,
                    label: weightNum.toString(),
                    data: { ...e.data, weight: weightNum },
                };
            })
        );

        setEdgeMenu((prev) => ({ ...prev, weight: weightNum }));
    };

    const handleDirectionChange = (directionCode) => {
        if (!edgeMenu) return;

        const isBiDir = directionCode === 1;
        const isForward = directionCode === 3;
        const isReverse = directionCode === 2;

        setEdges((eds) =>
            eds.map((e) => {
                if (e.id !== edgeMenu.edgeId) return e;
                return {
                    ...e,
                    data: { ...e.data, directionCode },
                    markerEnd: isBiDir || isForward ? ARROW_CONFIG : undefined,
                    markerStart: isBiDir || isReverse ? buildArrowConfig(DEFAULT_EDGE_COLOR, true) : undefined,
                };
            })
        );

        setEdgeMenu(null);
    };

    const handleDeleteEdge = () => {
        if (!edgeMenu) return;
        setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.edgeId));
        setEdgeMenu(null);
    };

    const handleCellClick = (startIdx, endIdx) => {
        if (!resultData || !resultData.paths) return;

        const pathsArray = resultData.paths[startIdx][endIdx];

        if (pathsArray && pathsArray.length > 0) {
            const allPathsIds = pathsArray.map((singlePath) =>
                singlePath.map((idx) => (idx + 1).toString())
            );
            console.log(allPathsIds)
            setHighlightedPaths(allPathsIds);

            if (viewMode === 'matrix') {
                setViewMode('visual');
            }
        } else {
            setHighlightedPaths([]);
        }
    };

    const clearHighlight = () => setHighlightedPaths([]);

    return (
        <div className="calculator-page">
            <Sidebar
                onCalculate={handleCalculate}
                error={error}
                isLoading={isLoading}
                edgeMenu={edgeMenu}
                onDirectionChange={handleDirectionChange}
                onDeleteEdge={handleDeleteEdge}
                onWeightChange={handleEdgeWeightChange}
                onOpenSaveModal={openSaveModal}
                onOpenLoadModal={openLoadModal}
            />

            <div className="flowboard-container">
                <div className="calc-toolbar">
                    <div className="calc-toolbar__group">
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`calc-tab ${viewMode === 'visual' ? 'is-active' : ''}`}
                        >
                            🎨 Граф
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`calc-tab ${viewMode === 'matrix' ? 'is-active' : ''}`}
                        >
                            🔢 Таблиця
                        </button>
                    </div>

                    {viewMode === 'visual' && (
                        <div className="calc-toolbar__group">
                            <button
                                onClick={() => handleAutoLayout('TB')}
                                className="calc-tab"
                                title="Розкласти граф: зверху вниз"
                                disabled={nodes.length < 2}
                            >
                                ⬇ Упорядкувати
                            </button>
                            <button
                                onClick={() => handleAutoLayout('LR')}
                                className="calc-tab"
                                title="Розкласти граф: ліворуч праворуч"
                                disabled={nodes.length < 2}
                            >
                                ➡ По горизонталі
                            </button>
                            {highlightedPaths.length > 0 && (
                                <button
                                    onClick={clearHighlight}
                                    className="calc-tab calc-tab--ghost"
                                    title="Прибрати підсвічування маршрутів"
                                >
                                    ✕ Зняти виділення
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="calc-view">
                    <div
                        className="calc-view__panel"
                        style={{ display: viewMode === 'visual' ? 'block' : 'none' }}
                    >
                        <FlowBoard
                            nodes={nodes}
                            setNodes={setNodes}
                            edges={edges}
                            setEdges={setEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onEdgeClick={handleEdgeClick}
                            edgeMenu={edgeMenu}
                            setEdgeMenu={setEdgeMenu}
                            onDirectionChange={handleDirectionChange}
                            onDeleteEdge={handleDeleteEdge}
                        />

                        {highlightedPaths.length > 1 && viewMode === 'visual' && (
                            <div className="calc-legend">
                                <strong>Альтернативні маршрути:</strong>
                                {highlightedPaths.map((_, idx) => (
                                    <div key={idx} className="calc-legend__item">
                                        <span
                                            className="calc-legend__dot"
                                            style={{ background: PATH_COLORS[idx % PATH_COLORS.length] }}
                                        />
                                        Варіант {idx + 1}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {viewMode === 'matrix' && (
                        <div className="calc-view__panel calc-view__panel--scroll">
                            <MatrixInput
                                nodes={nodes}
                                setNodes={setNodes}
                                edges={edges}
                                setEdges={setEdges}
                            />
                        </div>
                    )}
                </div>

                <ResultPanel result={resultData} onCellClick={handleCellClick} nodes={nodes} />

                {isGraphModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsGraphModalOpen(false)}>
                        <div
                            className="modal-content calc-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4>
                                {graphModalMode === 'save' ? 'Зберегти граф' : 'Завантажити граф'}
                            </h4>

                            {modalError && <div className="calc-modal__error">{modalError}</div>}

                            {graphModalMode === 'save' ? (
                                <>
                                    <input
                                        type="text"
                                        value={graphNameInput}
                                        onChange={(e) => setGraphNameInput(e.target.value)}
                                        placeholder="Введіть назву графа"
                                        className="weight-input calc-modal__input"
                                        autoFocus
                                    />
                                    <div className="modal-actions calc-modal__actions">
                                        <button
                                            className="btn-cancel"
                                            onClick={() => setIsGraphModalOpen(false)}
                                            disabled={isLoading}
                                        >
                                            Скасувати
                                        </button>
                                        <button
                                            className="btn-confirm"
                                            onClick={submitSaveGraph}
                                            disabled={isLoading || !graphNameInput.trim()}
                                        >
                                            {isLoading ? 'Збереження...' : 'Зберегти'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="calc-modal__list">
                                        {isLoading && savedGraphs.length === 0 ? (
                                            <p className="calc-modal__empty">Завантаження...</p>
                                        ) : savedGraphs.length === 0 ? (
                                            <p className="calc-modal__empty">Немає збережених графів</p>
                                        ) : (
                                            savedGraphs.map((graph) => (
                                                <div key={graph._id} className="calc-modal__item">
                                                    <span className="calc-modal__item-name">{graph.name}</span>
                                                    <div className="calc-modal__item-actions">
                                                        <button
                                                            onClick={() => loadGraph(graph._id)}
                                                            className="calc-modal__btn calc-modal__btn--primary"
                                                            disabled={isLoading}
                                                        >
                                                            Відкрити
                                                        </button>
                                                        <button
                                                            onClick={() => deleteGraph(graph._id)}
                                                            className="calc-modal__btn calc-modal__btn--danger"
                                                            title="Видалити"
                                                            disabled={isLoading}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="modal-actions calc-modal__actions">
                                        <button
                                            className="btn-cancel"
                                            onClick={() => setIsGraphModalOpen(false)}
                                        >
                                            Закрити
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CalculatorPage = () => {
    return (
        <ReactFlowProvider>
            <CalculatorContent />
        </ReactFlowProvider>
    );
};

export default CalculatorPage;
