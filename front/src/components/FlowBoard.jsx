// src/components/FlowBoard.jsx
import React, { useRef, useCallback, useState } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

// Глобальный счетчик ID для новых точек
let id = 2;
const getNodeId = () => `${id++}`;

const FlowBoard = ({ nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    // Логика соединения точек
    const onConnect = useCallback((params) => {
        const weight = prompt('Введите вес (расстояние) для этой связи:');
        if (weight === null || isNaN(parseInt(weight)) || weight < 0) return;

        const newEdge = {
            ...params,
            id: `${params.source}-${params.target}`,
            label: weight,
            data: { weight: parseInt(weight) },
            type: 'default',
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

    // Логика двойного клика (добавление точки)
    const handleWrapperDoubleClick = useCallback((event) => {
        if (!reactFlowWrapper.current || !reactFlowInstance) return;
        if (event.target.closest('.react-flow__node') || event.target.closest('.react-flow__edge')) return;

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newId = getNodeId();
        const newNode = {
            id: newId,
            position,
            data: { label: `Точка ${newId}` },
        };

        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

    return (
        <div
            className="flow-wrapper"
            style={{ width: '100%', height: '100vh', borderLeft: '1px solid #ccc' }}
            ref={reactFlowWrapper}
            onDoubleClick={handleWrapperDoubleClick}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                fitView
            >
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
};

export default FlowBoard;