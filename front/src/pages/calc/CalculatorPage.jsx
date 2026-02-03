import React, { useState } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import FlowBoard from '../../components/FlowBoard';
import Sidebar from '../../components/SideBar';
import ResultPanel from '../../components/ResultPanel';
// 1. Импортируем новый компонент
import MatrixInput from '../../components/MatrixInput'; // <--- НОВОЕ
import { generateMatrices } from '../../utils/MatrixHelpres';
import axios from 'axios';

const initialNodes = [
    { id: '1', type: 'default', data: { label: 'Точка 1' }, position: { x: 100, y: 100 } },
];

const CalculatorContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // 2. Добавляем состояние для переключения между Графом и Матрицей
    const [viewMode, setViewMode] = useState('visual'); // <--- НОВОЕ ('visual' или 'matrix')

    const [resultMatrix, setResultMatrix] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCalculate = async () => {
        setError(null);
        setResultMatrix(null);
        setIsLoading(true);

        try {
            const { bind, weight, totalNodes } = generateMatrices(edges);

            // Логи для отладки
            console.group('📊 Данные перед отправкой');
            console.log(`Всего узлов: ${totalNodes}`);
            console.table(bind);
            console.table(weight);
            console.groupEnd();
            console.log(weight, bind, totalNodes)
            const response = await axios.post('/api/calculate/calculate', {
                bind,
                weight,
                totalNodes
            });

            if (response.status !== 200) throw new Error('Ошибка сети или сервера');

            const result = await response.data;
            setResultMatrix(result);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='calculator-page'>

            <Sidebar
                onCalculate={handleCalculate}
                error={error}
                isLoading={isLoading}
            />

            {/* Контейнер для правой части */}
            <div className='flowboard-container' style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* 3. Кнопки переключения режимов */}
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

                {/* Основная рабочая область */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

                    {/* 4. Граф (скрываем через CSS, чтобы не терять зум/позицию) */}
                    <div style={{ height: '100%', display: viewMode === 'visual' ? 'block' : 'none' }}>
                        <FlowBoard
                            nodes={nodes}
                            setNodes={setNodes}
                            edges={edges}
                            setEdges={setEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                        />
                    </div>

                    {/* 5. Матрица (рендерим по условию) */}
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

                <ResultPanel result={resultMatrix} />
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