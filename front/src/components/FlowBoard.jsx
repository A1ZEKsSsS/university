import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import SmartEdge from './SmartEdge';
import CustomEdge from './CustomEdge';
import SmartStepEdge from './SmartStepEdge';
import SmartNode from './SmartNode';
import SmartBendableEdge from './BendableEdge';


let id = 2;
const getNodeId = () => `${id++}`;

const defaultEdgeOptions = {
    // interactionWidth: 25,
    style: { strokeWidth: 2, stroke: '#b1b1b7', cursor: 'pointer' },
    type: 'bendable',
    pathOptions: { borderRadius: 20 },
    labelShowBg: true,
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, stroke: '#dee2e6', strokeWidth: 1 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 6,
    labelStyle: { fontSize: 12, fontWeight: 700, fill: '#495057' },
};

const FlowBoard = ({ nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange, onEdgeClick }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState(null);
    const [weightInputValue, setWeightInputValue] = useState('');

    const edgeTypes = useMemo(() => ({
        smart: SmartBendableEdge,
        bendable: SmartBendableEdge,
    }), []);

    const nodeTypes = useMemo(() => ({
        default: SmartNode,
        smart: SmartNode,
    }), []);

    useEffect(() => {
        setEdges((eds) => {
            const outgoingMap = {};
            const incomingMap = {};

            eds.forEach(edge => {
                if (!outgoingMap[edge.source]) outgoingMap[edge.source] = [];
                outgoingMap[edge.source].push(edge);

                if (!incomingMap[edge.target]) incomingMap[edge.target] = [];
                incomingMap[edge.target].push(edge);
            });

            let hasChanges = false;

            const newEdges = eds.map(edge => {

                const sourceGroup = outgoingMap[edge.source];

                sourceGroup.sort((a, b) => a.target.localeCompare(b.target));
                const sourceIndex = sourceGroup.findIndex(e => e.id === edge.id);
                const newSourceHandle = `s-${sourceIndex}`;

                const targetGroup = incomingMap[edge.target];

                targetGroup.sort((a, b) => a.source.localeCompare(b.source));
                const targetIndex = targetGroup.findIndex(e => e.id === edge.id);
                const newTargetHandle = `t-${targetIndex}`;

                if (edge.sourceHandle === newSourceHandle && edge.targetHandle === newTargetHandle) {
                    return edge;
                }

                hasChanges = true;
                return {
                    ...edge,
                    sourceHandle: newSourceHandle,
                    targetHandle: newTargetHandle,
                };
            });

            return hasChanges ? newEdges : eds;
        });
    }, [
        edges.length,
        setEdges
    ]);


    const onNodeDoubleClick = useCallback((event, node) => {
        event.preventDefault();
        event.stopPropagation();

        const label = prompt('Введите новое название точки:', node.data.label);

        if (label === null || label.trim() === '') return;

        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: label,
                        },
                    };
                }
                return n;
            })
        );
    }, [setNodes]);

    const onConnect = useCallback((params) => {

        setPendingConnection(params);
        setWeightInputValue('');
        setIsWeightModalOpen(true);

        const newEdge = {
            ...params,
            id: `e${params.source}-${params.target}-${Date.now()}`,
            label: weight,
            type: 'bendable',
            pathOptions: { borderRadius: 20 },
            data: { offsetX: 0, offsetY: 0, directionCode: 1 },
            markerEnd: { type: 'arrowclosed' },
            markerStart: { type: 'arrowclosed' },
            style: { strokeWidth: 2, stroke: '#b1b1b7' },
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

    const handleCancelConnection = () => {
        setIsWeightModalOpen(false);
        setPendingConnection(null);
    };

    const handleConfirmConnection = () => {
        const weight = parseInt(weightInputValue, 10);

        if (isNaN(weight) || weight < 0) {
            alert('Пожалуйста, введите корректный вес (число >= 0)');
            return;
        }

        const newEdge = {
            ...pendingConnection,
            id: `e${pendingConnection.source}-${pendingConnection.target}-${Date.now()}`,
            label: weight.toString(),
            type: 'bendable',
            pathOptions: { borderRadius: 20 },
            data: {
                offsetX: 0,
                offsetY: 0,
                directionCode: 1,
                weight: weight
            },
            markerEnd: { type: 'arrowclosed' },
            markerStart: { type: 'arrowclosed' },
            style: { strokeWidth: 2, stroke: '#b1b1b7' },
        };

        setEdges((eds) => addEdge(newEdge, eds));

        setIsWeightModalOpen(false);
        setPendingConnection(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConfirmConnection();
        } else if (e.key === 'Escape') {
            handleCancelConnection();
        }
    };

    const handleWrapperDoubleClick = useCallback((event) => {
        if (!reactFlowWrapper.current || !reactFlowInstance) return;

        if (event.target.closest('.react-flow__node') || event.target.closest('.react-flow__edge')) {
            return;
        }

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
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

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.confirm(`Удалить ${node.data.label}?`)) {
            setNodes((nds) => nds.filter((n) => n.id !== node.id));
            setEdges((eds) => eds.filter((edge) => edge.source !== node.id && edge.target !== node.id));
        }
    }, [setNodes, setEdges]);

    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        event.stopPropagation();
        if (window.confirm(`Удалить связь весом ${edge.label}?`)) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }
    }, [setEdges]);

    return (
        <div
            className="flow-wrapper"
            style={{ width: '100%', height: '100%', borderLeft: '1px solid #ccc', background: '#f8f9fa' }}
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
                onEdgeClick={onEdgeClick}

                onNodeDoubleClick={onNodeDoubleClick}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                zoomOnDoubleClick={false}
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Controls />
                <Background variant="dots" gap={20} size={1} color="#ccc" />

                {isWeightModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>Новая связь</h4>
                            <p>Введите вес (расстояние) для связи:</p>

                            <input
                                type="number"
                                autoFocus
                                value={weightInputValue}
                                onChange={(e) => setWeightInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Например: 15"
                                className="weight-popup-input"
                            />

                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={handleCancelConnection}>
                                    Отмена
                                </button>
                                <button className="btn-confirm" onClick={handleConfirmConnection}>
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ReactFlow>
        </div>
    );
};

export default FlowBoard;