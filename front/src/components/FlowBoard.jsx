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


// Импортируйте ваш кастомный компонент (если вы его создали по прошлому совету)
// import CustomEdge from './CustomEdge'; 

let id = 2;
const getNodeId = () => `${id++}`;

// Настройки по умолчанию
const defaultEdgeOptions = {
    // interactionWidth: 25,
    style: { strokeWidth: 2, stroke: '#b1b1b7', cursor: 'pointer' },
    // type: 'smoothstep',
    type: 'smart',
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

    const edgeTypes = useMemo(() => ({
        smart: SmartStepEdge,
    }), []);

    const nodeTypes = useMemo(() => ({
        // Заменяем стандартный на наш умный
        default: SmartNode,
        smart: SmartNode,
    }), []);

    // Внутри FlowBoard.jsx

    // ... внутри FlowBoard ...

    useEffect(() => {
        setEdges((eds) => {
            // Словарь для группировки:
            // outgoingMap[sourceId] = [edge1, edge2...]
            // incomingMap[targetId] = [edge1, edge2...]
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
                // 1. Ищем, какой порт занять на ВЫХОДЕ (Source)
                const sourceGroup = outgoingMap[edge.source];
                // Сортируем по ID целевого узла, чтобы линии не переплетались
                // (линия к левому узлу выйдет из левого порта)
                sourceGroup.sort((a, b) => a.target.localeCompare(b.target));
                const sourceIndex = sourceGroup.findIndex(e => e.id === edge.id);
                const newSourceHandle = `s-${sourceIndex}`;

                // 2. Ищем, какой порт занять на ВХОДЕ (Target)
                const targetGroup = incomingMap[edge.target];
                // Сортируем по ID исходного узла
                targetGroup.sort((a, b) => a.source.localeCompare(b.source));
                const targetIndex = targetGroup.findIndex(e => e.id === edge.id);
                const newTargetHandle = `t-${targetIndex}`;

                // Если порты не изменились - возвращаем старый объект (чтобы React не ререндерил зря)
                if (edge.sourceHandle === newSourceHandle && edge.targetHandle === newTargetHandle) {
                    return edge;
                }

                hasChanges = true;
                return {
                    ...edge,
                    sourceHandle: newSourceHandle, // Привязываем к нижнему порту
                    targetHandle: newTargetHandle, // Привязываем к верхнему порту
                };
            });

            return hasChanges ? newEdges : eds;
        });
    }, [
        edges.length, // Обновляем только когда меняется кол-во связей
        // nodes, // Можно раскомментировать, если порты зависят от координат узлов
        setEdges
    ]);

    // === НОВОЕ: ПЕРЕИМЕНОВАНИЕ ПО ДВОЙНОМУ КЛИКУ ===
    const onNodeDoubleClick = useCallback((event, node) => {
        // Останавливаем всплытие, чтобы не сработал клик по подложке (создание точки)
        event.preventDefault();
        event.stopPropagation();

        // Спрашиваем новое имя
        const label = prompt('Введите новое название точки:', node.data.label);

        // Если нажали отмену или ввели пустоту — ничего не делаем
        if (label === null || label.trim() === '') return;

        // Обновляем состояние узлов
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    // Создаем копию узла с новым label внутри data
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: label, // Новое имя
                        },
                    };
                }
                return n;
            })
        );
    }, [setNodes]);

    const onConnect = useCallback((params) => {
        const weight = prompt('Введите вес (расстояние) для этой связи:');
        if (weight === null || isNaN(parseInt(weight)) || parseInt(weight) < 0) return;

        const newEdge = {
            ...params,
            id: `e${params.source}-${params.target}-${Date.now()}`,
            label: weight,
            // type: 'smoothstep',
            type: 'smart',
            pathOptions: { borderRadius: 20 },
            data: { weight: parseInt(weight), directionCode: 1 },
            markerEnd: { type: 'arrowclosed' },
            markerStart: { type: 'arrowclosed' },
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

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

    // ... (ваши onNodeContextMenu и onEdgeContextMenu остаются без изменений) ...
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

                // === ПОДКЛЮЧАЕМ ОБРАБОТЧИК ===
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
            </ReactFlow>
        </div>
    );
};

export default FlowBoard;