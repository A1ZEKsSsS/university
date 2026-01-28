import React, { useState } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import FlowBoard from '../../components/FlowBoard';
import Sidebar from '../../components/SideBar';
import ResultPanel from '../../components/ResultPanel';
import { generateMatrices } from '../../utils/MatrixHelpres';
import axios from 'axios';


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
            const { bind, weight, totalNodes } = generateMatrices(edges);

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

            <div className='flowboard-container'>
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