import React, { useState, useEffect } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import FlowBoard from '../../components/FlowBoard';
import Sidebar from '../../components/SideBar';
import ResultPanel from '../../components/ResultPanel';
import MatrixInput from '../../components/MatrixInput';
import { generateMatrices } from '../../utils/MatrixHelpres';
import axios from 'axios';

const initialNodes = [
    { id: '1', type: 'default', data: { label: 'Точка 1' }, position: { x: 100, y: 100 } },
];

const PATH_COLORS = [
    '#ff0072', // Розовый (основной)
    '#00d2ff', // Голубой
    '#00ff48', // Ярко-зеленый
    '#ff9f00', // Оранжевый
    '#9d00ff', // Фиолетовый
    '#ffea00'  // Желтый
];

const CalculatorContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [viewMode, setViewMode] = useState('visual');

    const [resultData, setResultData] = useState(null);

    const [highlightedPaths, setHighlightedPaths] = useState([]);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [edgeMenu, setEdgeMenu] = useState(null);

    const ARROW_CONFIG = {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#b1b1b7',
    };
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                let strokeColor = '#b1b1b7';
                let strokeWidth = 2;
                let isAnimated = false;
                let zIndex = 0;
                let fontWeight = 'normal';
                let labelBgColor = '#ffffff';

                if (highlightedPaths.length > 0) {
                    for (let pathIdx = 0; pathIdx < highlightedPaths.length; pathIdx++) {
                        const path = highlightedPaths[pathIdx];

                        let belongsToPath = false;
                        for (let i = 0; i < path.length - 1; i++) {
                            const u = path[i];
                            const v = path[i + 1];

                            if ((edge.source === u && edge.target === v) ||
                                (edge.source === v && edge.target === u)) {
                                belongsToPath = true;
                                break;
                            }
                        }

                        if (belongsToPath) {
                            strokeColor = PATH_COLORS[pathIdx % PATH_COLORS.length];
                            strokeWidth = 4;
                            isAnimated = true;
                            zIndex = 1000;
                            fontWeight = 'bold';
                            break;
                        }
                    }
                }

                return {
                    ...edge,
                    type: 'smoothstep',
                    pathOptions: { borderRadius: 20 },
                    interactionWidth: 25,

                    style: {
                        ...edge.style,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        cursor: 'pointer'
                    },
                    animated: isAnimated,
                    zIndex: zIndex,

                    labelStyle: {
                        ...edge.labelStyle,
                        fill: strokeColor === '#b1b1b7' ? '#000' : strokeColor,
                        fontWeight: fontWeight,
                        fontSize: 12,
                    },
                    labelShowBg: true,
                    labelBgStyle: { fill: labelBgColor, fillOpacity: 0.9, stroke: '#dee2e6', strokeWidth: 1 },
                    labelBgPadding: [6, 4],
                    labelBgBorderRadius: 6,
                };
            })
        );
    }, [highlightedPaths, setEdges]);

    const handleCalculate = async () => {
        setError(null);
        setResultData(null);
        setHighlightedPaths([]);
        setIsLoading(true);

        try {
            const { bind, weight, totalNodes } = generateMatrices(edges);

            console.group('📊 Данные перед отправкой');
            console.log(`Всего узлов: ${totalNodes}`);
            console.table(bind);
            console.table(weight);
            console.groupEnd();

            const response = await axios.post('/api/calculate/calculate', {
                bind,
                weight,
                totalNodes
            });

            if (response.status !== 200) throw new Error('Ошибка сети или сервера');

            const result = await response.data;
            setResultData(result);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEdgeClick = (event, edge) => {
        event.stopPropagation();

        setEdgeMenu({
            edgeId: edge.id,
            x: event.clientX,
            y: event.clientY
        });

        setEdges((eds) => eds.map((e) => {
            if (e.id !== edge.id) return { ...e, selected: false, zIndex: 0 };
            return { ...e, selected: true, zIndex: 100, type: 'bendable' };
        }));
    };

    const handleDirectionChange = (directionCode) => {
        if (!edgeMenu) return;

        const isBiDir = directionCode === 1;
        const isForward = directionCode === 3;
        const isReverse = directionCode === 2;

        setEdges((eds) => eds.map((e) => {
            if (e.id !== edgeMenu.edgeId) return e;
            return {
                ...e,
                data: { ...e.data, directionCode },
                markerEnd: (isBiDir || isForward) ? ARROW_CONFIG : undefined,
                markerStart: (isBiDir || isReverse) ? ARROW_CONFIG : undefined,
            };
        }));

        setEdgeMenu(null);
    };

    const handleDeleteEdge = () => {
        if (!edgeMenu) return;
        setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.edgeId));
        setEdgeMenu(null);
    };

    const handleEdgeDoubleClick = (event, edge) => {
        event.stopPropagation();

        setEdges((eds) => eds.map((e) => {
            if (e.id !== edge.id) return { ...e, zIndex: 0 };

            const currentDir = e.data?.directionCode || 1;
            let nextDir = 1;
            if (currentDir === 1) nextDir = 3;
            else if (currentDir === 3) nextDir = 2;
            else if (currentDir === 2) nextDir = 1;

            const isBiDir = nextDir === 1;
            const isForward = nextDir === 3;
            const isReverse = nextDir === 2;

            return {
                ...e,
                id: `e${e.source}-${e.target}-${Date.now()}`,
                zIndex: 100,
                data: {
                    ...e.data,
                    directionCode: nextDir
                },
                markerEnd: (isBiDir || isForward) ? ARROW_CONFIG : undefined,
                markerStart: (isBiDir || isReverse) ? ARROW_CONFIG : undefined,
                style: { strokeWidth: 2, stroke: '#b1b1b7', cursor: 'pointer' }
            };
        }));
    };
    const handleCellClick = (startIdx, endIdx) => {
        if (!resultData || !resultData.paths) return;

        const pathsArray = resultData.paths[startIdx][endIdx];

        if (pathsArray && pathsArray.length > 0) {
            const allPathsIds = pathsArray.map(singlePath =>
                singlePath.map(idx => (idx + 1).toString())
            );

            setHighlightedPaths(allPathsIds);

            if (viewMode === 'matrix') {
                setViewMode('visual');
            }

            console.log(`Найдено маршрутов: ${allPathsIds.length}`);
        } else {
            setHighlightedPaths([]);
        }
    };



    return (
        <div className='calculator-page'>

            <Sidebar
                onCalculate={handleCalculate}
                error={error}
                isLoading={isLoading}
            />

            <div className='flowboard-container' style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                <div style={{ padding: '10px 20px', background: '#f8f9fa', borderBottom: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setViewMode('visual')}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontWeight: viewMode === 'visual' ? 'bold' : 'normal',
                            backgroundColor: viewMode === 'visual' ? '#e9ecef' : 'transparent',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        🎨 Граф
                    </button>
                    <button
                        onClick={() => setViewMode('matrix')}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontWeight: viewMode === 'matrix' ? 'bold' : 'normal',
                            backgroundColor: viewMode === 'matrix' ? '#e9ecef' : 'transparent',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    >
                        🔢 Таблица
                    </button>
                </div>

                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ height: '100%', display: viewMode === 'visual' ? 'block' : 'none' }}>
                        <FlowBoard
                            nodes={nodes}
                            setNodes={setNodes}
                            edges={edges}
                            setEdges={setEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onEdgeClick={handleEdgeClick}
                            onEdgeDoubleClick={handleEdgeDoubleClick}
                        />

                        {highlightedPaths.length > 1 && viewMode === 'visual' && (
                            <div style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: 'rgba(255,255,255,0.9)',
                                padding: '10px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                zIndex: 100
                            }}>
                                <strong>Альтернативные маршруты:</strong>
                                {highlightedPaths.map((_, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                        <div style={{ width: 12, height: 12, background: PATH_COLORS[idx % PATH_COLORS.length], marginRight: 6, borderRadius: '2px' }}></div>
                                        Вариант {idx + 1}
                                    </div>
                                ))}
                            </div>
                        )}

                        {edgeMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: edgeMenu.x,
                                    top: edgeMenu.y,
                                    background: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                                    zIndex: 2000,
                                    minWidth: '150px'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => handleDirectionChange(1)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px 15px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        borderBottom: '1px solid #eee',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    ↔️ Двусторонняя
                                </button>
                                <button
                                    onClick={() => handleDirectionChange(3)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px 15px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        borderBottom: '1px solid #eee',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    → Вперед
                                </button>
                                <button
                                    onClick={() => handleDirectionChange(2)}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px 15px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        borderBottom: '1px solid #eee',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    ← Назад
                                </button>
                                <button
                                    onClick={handleDeleteEdge}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '10px 15px',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#d32f2f',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#ffebee'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    🗑️ Удалить
                                </button>
                            </div>
                        )}
                    </div>

                    {viewMode === 'matrix' && (
                        <div style={{ height: '100%', overflow: 'auto' }}>
                            <MatrixInput
                                nodes={nodes}
                                setNodes={setNodes}
                                edges={edges}
                                setEdges={setEdges}
                            />
                        </div>
                    )}
                </div>

                <ResultPanel
                    result={resultData}
                    onCellClick={handleCellClick}
                />
            </div>
        </div>
    );
}

const CalculatorPage = () => {
    return (
        <ReactFlowProvider>
            <CalculatorContent />
        </ReactFlowProvider>
    );
};

export default CalculatorPage;