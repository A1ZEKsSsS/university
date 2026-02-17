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

// Палитра цветов для разных маршрутов
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

    // ИЗМЕНЕНИЕ 1: Храним массив массивов (все найденные пути)
    const [highlightedPaths, setHighlightedPaths] = useState([]);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const ARROW_CONFIG = {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#b1b1b7',
    };
    // === ЭФФЕКТ ДЛЯ ПОДСВЕТКИ ПУТЕЙ РАЗНЫМИ ЦВЕТАМИ ===
    // === ЭФФЕКТ: ПОДСВЕТКА НАЙДЕННОГО ПУТИ ===
    useEffect(() => {
        setEdges((eds) =>
            eds.map((edge) => {
                // Настройки по умолчанию (неактивная линия)
                let strokeColor = '#b1b1b7';
                let strokeWidth = 2; // Чуть толще по умолчанию для читаемости
                let isAnimated = false;
                let zIndex = 0; // Обычные линии внизу
                let fontWeight = 'normal';
                let labelBgColor = '#ffffff'; // Белый фон для обычного текста

                // Проверяем, входит ли ребро в один из путей
                if (highlightedPaths.length > 0) {
                    for (let pathIdx = 0; pathIdx < highlightedPaths.length; pathIdx++) {
                        const path = highlightedPaths[pathIdx];

                        // Логика поиска (u->v или v->u)
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

                        // Если ребро часть пути — красим
                        if (belongsToPath) {
                            strokeColor = PATH_COLORS[pathIdx % PATH_COLORS.length];
                            strokeWidth = 4; // Делаем путь жирным
                            isAnimated = true; // "Бегущие муравьи"
                            zIndex = 1000; // <--- ВАЖНО: Путь всегда поверх всего!
                            fontWeight = 'bold';
                            // Можно даже подкрасить фон текста в цвет пути (опционально)
                            // labelBgColor = '#fff0f6'; 
                            break;
                        }
                    }
                }

                return {
                    ...edge,
                    // === ПРИНУДИТЕЛЬНЫЙ ДИЗАЙН ===
                    type: 'smoothstep', // Прямые углы
                    pathOptions: { borderRadius: 20 }, // Скругление
                    interactionWidth: 25, // Удобный клик

                    style: {
                        ...edge.style,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        cursor: 'pointer'
                    },
                    animated: isAnimated,
                    zIndex: zIndex, // Применяем слой (0 или 1000)

                    // Настройки текста
                    labelStyle: {
                        ...edge.labelStyle, // Сохраняем старые стили если были
                        fill: strokeColor === '#b1b1b7' ? '#000' : strokeColor, // Текст цвета линии
                        fontWeight: fontWeight,
                        fontSize: 12,
                    },
                    // Убеждаемся, что фон текста включен (если вдруг defaultEdgeOptions не сработал)
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
        setHighlightedPaths([]); // Сброс
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

        setEdges((eds) => eds.map((e) => {
            // Сбрасываем zIndex для остальных линий
            if (e.id !== edge.id) return { ...e, zIndex: 0 };

            // 1. Логика смены направления
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
                // Обновляем ID для перерисовки стрелок
                id: `e${e.source}-${e.target}-${Date.now()}`,

                // Поднимаем наверх, чтобы стрелки были видны поверх других линий,
                // но НЕ делаем линию жирной
                zIndex: 100,

                type: 'smoothstep',
                pathOptions: { borderRadius: 20 },

                selected: false, // Важно: убирает стандартное синее выделение
                data: {
                    ...e.data,
                    directionCode: nextDir
                },

                markerEnd: (isBiDir || isForward) ? ARROW_CONFIG : undefined,
                markerStart: (isBiDir || isReverse) ? ARROW_CONFIG : undefined,

                // === ИСПРАВЛЕНИЕ ===
                style: {
                    strokeWidth: 2, // Было 3, вернули 2 (стандартная толщина)
                    stroke: '#b1b1b7', // Вернули серый цвет (было #555)
                    cursor: 'pointer'
                }
            };
        }));
    };
    // ИЗМЕНЕНИЕ 3: Обрабатываем все пути сразу
    const handleCellClick = (startIdx, endIdx) => {
        if (!resultData || !resultData.paths) return;

        // pathsArray - это массив массивов (список альтернативных путей)
        const pathsArray = resultData.paths[startIdx][endIdx];

        if (pathsArray && pathsArray.length > 0) {
            // Превращаем каждый путь (массив индексов) в массив ID (строк)
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
                        />

                        {/* Легенда, если путей больше одного */}
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