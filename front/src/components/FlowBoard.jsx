import React, { useRef, useCallback, useState } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';


let id = 2;
const getNodeId = () => `${id++}`;

const FlowBoard = ({ nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onConnect = useCallback((params) => {
        const weight = prompt('Введите вес (расстояние) для этой связи:');

        if (weight === null || isNaN(parseInt(weight)) || parseInt(weight) < 0) return;

        const newEdge = {
            ...params,
            id: `e${params.source}-${params.target}-${Date.now()}`,
            label: weight,
            data: { weight: parseInt(weight) },
            type: 'default',
            markerEnd: { type: 'arrowclosed' },
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

    const handleWrapperDoubleClick = useCallback((event) => {
        if (!reactFlowWrapper.current || !reactFlowInstance) return;

        if (event.target.closest('.react-flow__node') || event.target.closest('.react-flow__edge')) {
            return;
        }

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
            type: 'default',
        };

        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();

            const confirmDelete = confirm(`Удалить ${node.data.label}?`);
            if (!confirmDelete) return;

            setNodes((nds) => nds.filter((n) => n.id !== node.id));

            setEdges((eds) => eds.filter((edge) => edge.source !== node.id && edge.target !== node.id));
        },
        [setNodes, setEdges]
    );

    const onEdgeContextMenu = useCallback(
        (event, edge) => {
            event.preventDefault();

            const confirmDelete = confirm(`Удалить связь весом ${edge.label}?`);
            if (!confirmDelete) return;

            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges]
    );

    return (
        <div
            className="flow-wrapper"
            style={{ width: '100%', height: '100%', borderLeft: '1px solid #ccc' }}
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

                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}

                fitView
                zoomOnDoubleClick={false}
                paneClickDistance={0}

                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

export default FlowBoard;