import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import SmartNode from './SmartNode';
import SmartBendableEdge from './BendableEdge';
// import './FlowBoard.css';

// --- Константи поза компонентом ---

const DEFAULT_EDGE_COLOR = '#b1b1b7';

const defaultEdgeOptions = {
    style: { strokeWidth: 2, stroke: DEFAULT_EDGE_COLOR, cursor: 'pointer' },
    type: 'bendable',
    pathOptions: { borderRadius: 20 },
    labelShowBg: true,
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, stroke: '#dee2e6', strokeWidth: 1 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 6,
    labelStyle: { fontSize: 12, fontWeight: 700, fill: '#495057' },
};

// Генератор унікальних ID (стійкий до швидкого створення)
const makeId = (prefix = 'e') => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const FlowBoard = ({ nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange, onEdgeClick }) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState(null);
    const [weightInputValue, setWeightInputValue] = useState('');
    const [weightError, setWeightError] = useState('');

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [isNodeRenameModalOpen, setIsNodeRenameModalOpen] = useState(false);
    const [nodeToRename, setNodeToRename] = useState(null);
    const [nodeNameInputValue, setNodeNameInputValue] = useState('');

    const edgeTypes = useMemo(() => ({
        smart: SmartBendableEdge,
        bendable: SmartBendableEdge,
    }), []);

    const nodeTypes = useMemo(() => ({
        default: SmartNode,
        smart: SmartNode,
    }), []);

    // --- Перерозподіл handles для рівномірного виходу з вузла ---
    // Фіксовано: слухаємо весь edges, а не лише .length
    useEffect(() => {
        setEdges((eds) => {
            const outgoingMap = {};
            const incomingMap = {};

            eds.forEach((edge) => {
                if (!outgoingMap[edge.source]) outgoingMap[edge.source] = [];
                outgoingMap[edge.source].push(edge);

                if (!incomingMap[edge.target]) incomingMap[edge.target] = [];
                incomingMap[edge.target].push(edge);
            });

            let hasChanges = false;

            const newEdges = eds.map((edge) => {
                const sourceGroup = outgoingMap[edge.source];
                sourceGroup.sort((a, b) => a.target.localeCompare(b.target));
                const sourceIndex = sourceGroup.findIndex((e) => e.id === edge.id);
                const newSourceHandle = `s-${sourceIndex}`;

                const targetGroup = incomingMap[edge.target];
                targetGroup.sort((a, b) => a.source.localeCompare(b.source));
                const targetIndex = targetGroup.findIndex((e) => e.id === edge.id);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [edges]);

    // --- Перейменування вузла ---

    const onNodeDoubleClick = useCallback((event, node) => {
        event.preventDefault();
        event.stopPropagation();

        setNodeToRename(node);
        setNodeNameInputValue(node.data.label || '');
        setIsNodeRenameModalOpen(true);
    }, []);

    const handleCancelNodeRename = () => {
        setIsNodeRenameModalOpen(false);
        setNodeToRename(null);
    };

    const handleConfirmNodeRename = () => {
        if (!nodeToRename || !nodeNameInputValue.trim()) return;

        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === nodeToRename.id) {
                    return { ...n, data: { ...n.data, label: nodeNameInputValue.trim() } };
                }
                return n;
            })
        );

        setIsNodeRenameModalOpen(false);
        setNodeToRename(null);
    };

    const handleNodeRenameKeyDown = (e) => {
        if (e.key === 'Enter') handleConfirmNodeRename();
        else if (e.key === 'Escape') handleCancelNodeRename();
    };

    // --- Створення ребра ---
    // Фіксовано: ребро створюється ОДИН раз, лише після підтвердження у модалці.
    // Раніше onConnect створював undefined-ребро з ReferenceError на `weight`,
    // а потім handleConfirmConnection додавав друге — виходило 2 ребра.

    const onConnect = useCallback((params) => {
        setPendingConnection(params);
        setWeightInputValue('');
        setWeightError('');
        setIsWeightModalOpen(true);
    }, []);

    const handleCancelConnection = () => {
        setIsWeightModalOpen(false);
        setPendingConnection(null);
        setWeightError('');
    };

    const handleConfirmConnection = () => {
        const weight = parseInt(weightInputValue, 10);

        if (Number.isNaN(weight) || weight < 0) {
            setWeightError('Введіть коректне число (≥ 0)');
            return;
        }

        if (!pendingConnection) return;

        const newEdge = {
            ...pendingConnection,
            id: makeId('e'),
            label: weight.toString(),
            data: {
                offsetX: 0,
                offsetY: 0,
                directionCode: 1,
                weight,
            },
            markerEnd: { type: 'arrowclosed', width: 20, height: 20, color: DEFAULT_EDGE_COLOR },
            markerStart: {
                type: 'arrowclosed',
                width: 20,
                height: 20,
                color: DEFAULT_EDGE_COLOR,
                orient: 'auto-start-reverse',
            },
            // type / style / pathOptions наслідуються з defaultEdgeOptions
        };

        setEdges((eds) => addEdge(newEdge, eds));

        setIsWeightModalOpen(false);
        setPendingConnection(null);
        setWeightError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleConfirmConnection();
        else if (e.key === 'Escape') handleCancelConnection();
    };

    // Скидаємо помилку при зміні вводу
    const handleWeightInputChange = (e) => {
        setWeightInputValue(e.target.value);
        if (weightError) setWeightError('');
    };

    // --- Створення вузла по подвійному кліку ---
    // Фіксовано: ID через makeId, щоб не було дублів при завантаженні графа
    // з сервера (де ID можуть бути у форматі uuid).

    const handleWrapperDoubleClick = useCallback(
        (event) => {
            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            if (
                event.target.closest('.react-flow__node') ||
                event.target.closest('.react-flow__edge')
            ) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Красива нумерація для label: беремо максимальний номер з label виду «Точка N»
            const existingNumbers = nodes
                .map((n) => {
                    const match = (n.data?.label || '').match(/Точка\s+(\d+)/);
                    return match ? parseInt(match[1], 10) : NaN;
                })
                .filter((n) => !Number.isNaN(n));
            const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

            const newNode = {
                id: makeId('n'),
                position,
                data: { label: `Точка ${nextNumber}` },
                type: 'default',
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, nodes, setNodes]
    );

    // --- Контекстне меню: видалення ---

    const onNodeContextMenu = useCallback((event, node) => {
        event.preventDefault();
        event.stopPropagation();
        setDeleteTarget({ type: 'node', item: node });
    }, []);

    const onEdgeContextMenu = useCallback((event, edge) => {
        event.preventDefault();
        event.stopPropagation();
        setDeleteTarget({ type: 'edge', item: edge });
    }, []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'node') {
            const nodeId = deleteTarget.item.id;
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        } else if (deleteTarget.type === 'edge') {
            const edgeId = deleteTarget.item.id;
            setEdges((eds) => eds.filter((e) => e.id !== edgeId));
        }

        setDeleteTarget(null);
    }, [deleteTarget, setNodes, setEdges]);

    const cancelDelete = useCallback(() => {
        setDeleteTarget(null);
    }, []);

    return (
        <div
            className="flow-wrapper"
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

                {/* Модалка ваги нового ребра */}
                {isWeightModalOpen && (
                    <div className="modal-overlay" onClick={handleCancelConnection}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h4>Новий зв'язок</h4>
                            <p>Введіть вагу (відстань) для зв'язку:</p>

                            <input
                                type="number"
                                autoFocus
                                value={weightInputValue}
                                onChange={handleWeightInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Наприклад: 15"
                                className="weight-popup-input"
                            />
                            {weightError && (
                                <span className="weight-error-text">{weightError}</span>
                            )}
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={handleCancelConnection}>
                                    Відміна
                                </button>
                                <button className="btn-confirm" onClick={handleConfirmConnection}>
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ReactFlow>

            {/* Модалка перейменування вузла */}
            {isNodeRenameModalOpen && (
                <div className="modal-overlay" onClick={handleCancelNodeRename}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h4>Змінити назву точки</h4>
                        <p>Введіть нову назву:</p>
                        <input
                            type="text"
                            autoFocus
                            onFocus={(e) => e.target.select()}
                            value={nodeNameInputValue}
                            onChange={(e) => setNodeNameInputValue(e.target.value)}
                            onKeyDown={handleNodeRenameKeyDown}
                            placeholder="Наприклад: Точка 1"
                            className="weight-popup-input"
                        />
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCancelNodeRename}>
                                Відміна
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={handleConfirmNodeRename}
                                disabled={!nodeNameInputValue.trim()}
                            >
                                Зберегти
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка видалення */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h4>Підтвердження видалення</h4>
                        <p>
                            {deleteTarget.type === 'node'
                                ? `Видалити "${deleteTarget.item.data?.label}" та всі пов'язані з нею лінії?`
                                : `Видалити зв'язок вагою ${deleteTarget.item.label || '0'}?`}
                        </p>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={cancelDelete}>
                                Відміна
                            </button>
                            <button className="btn-confirm error-btn" onClick={confirmDelete}>
                                Видалити
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlowBoard;
