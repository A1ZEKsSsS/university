// src/pages/CalculatorPage.jsx
import React, { useState } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
// import FlowBoard from '../components/FlowBoard';
import FlowBoard from '../../components/FlowBoard';
import Sidebar from '../../components/SideBar';
// import ResultPanel from '../components/ResultPanel';
import ResultPanel from '../../components/ResultPanel';
import { generateMatrices } from '../../utils/MatrixHelpres';
// import { generateMatrices } from '../../utils/matrixGenerator';
// import { generateMatrices } from '../../utils/MatrixHelpers';

const initialNodes = [
    { id: '1', type: 'default', data: { label: 'Точка 1' }, position: { x: 100, y: 100 } },
];

const CalculatorContent = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [resultMatrix, setResultMatrix] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCalculate = async () => {
        setError(null);
        setResultMatrix(null);
        setIsLoading(true);

        try {
            // 1. Генерируем матрицы (используем утилиту)
            const { bind, weight, totalNodes } = generateMatrices(edges);

            // 2. Отправляем запрос
            const response = await fetch('http://localhost:5001/api/calculate/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bind, weight, totalNodes }),
            });

            if (!response.ok) throw new Error('Ошибка сети или сервера');

            const result = await response.json();
            setResultMatrix(result);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // ReactFlowProvider нужен здесь, чтобы FlowBoard работал корректно
        <ReactFlowProvider>
            <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>

                <Sidebar
                    onCalculate={handleCalculate}
                    error={error}
                    isLoading={isLoading}
                />

                <div style={{ flex: 1, position: 'relative' }}>
                    <FlowBoard
                        nodes={nodes}
                        setNodes={setNodes}
                        edges={edges}
                        setEdges={setEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                    />

                    <ResultPanel result={resultMatrix} />
                </div>

            </div>
        </ReactFlowProvider>
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