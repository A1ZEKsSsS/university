// import React, { useState, useCallback, useRef } from 'react';
// import ReactFlow, {
//   ReactFlowProvider,
//   addEdge,
//   useNodesState,
//   useEdgesState,
//   Controls,
//   Background,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import './App.css';

// const initialNodes = [
//   {
//     id: '1',
//     type: 'default',
//     data: { label: 'Точка 1' },
//     position: { x: 100, y: 100 },
//   },
// ];

// let id = 2;
// const getNodeId = () => `${id++}`;


// function FlowArea() {
//   const reactFlowWrapper = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [reactFlowInstance, setReactFlowInstance] = useState(null);

//   const [resultMatrix, setResultMatrix] = useState(null);
//   const [error, setError] = useState(null);

//   const onConnect = useCallback((params) => {
//     const weight = prompt('Введите вес (расстояние) для этой связи:');
//     if (weight === null || isNaN(parseInt(weight)) || weight < 0) {
//       return;
//     }
//     const newEdge = {
//       ...params,
//       id: `${params.source}-${params.target}`,
//       label: weight,
//       data: { weight: parseInt(weight) },
//       type: 'default',
//     };
//     setEdges((eds) => addEdge(newEdge, eds));
//   }, [setEdges]);

//   // --- ИСПРАВЛЕННОЕ ДОБАВЛЕНИЕ (Через обертку) ---
//   const handleWrapperDoubleClick = useCallback((event) => {
//     // 1. Проверяем, что reactFlowInstance готов
//     if (!reactFlowWrapper.current || !reactFlowInstance) return;

//     // 2. ВАЖНО: Проверяем, куда мы кликнули.
//     // Если клик пришелся на УЗЕЛ (.react-flow__node) или СВЯЗЬ (.react-flow__edge),
//     // то мы НЕ должны создавать новую точку.
//     if (event.target.closest('.react-flow__node') || event.target.closest('.react-flow__edge')) {
//       return;
//     }

//     const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

//     // 3. Проецируем координаты (перевод из пикселей экрана в координаты React Flow)
//     const position = reactFlowInstance.project({
//       x: event.clientX - reactFlowBounds.left,
//       y: event.clientY - reactFlowBounds.top,
//     });

//     const newId = getNodeId();
//     const newNode = {
//       id: newId,
//       position,
//       data: { label: `Точка ${newId}` },
//     };

//     setNodes((nds) => nds.concat(newNode));
//   }, [reactFlowInstance, setNodes]); // Зависимости

//   // ... (Ваша функция handleCalculate остается без изменений) ...
//   const handleCalculate = async () => {
//     setError(null);
//     setResultMatrix(null);

//     // 1. ИСПРАВЛЕНО: используем edges вместо links
//     if (edges.length === 0) {
//       setError("Добавьте хотя бы одну связь");
//       return;
//     }

//     // 2. ИСПРАВЛЕНО: берем ID из свойств source и target
//     const nodes = new Set();
//     edges.forEach(edge => {
//       nodes.add(parseInt(edge.source)); // React Flow хранит ID как строки, преобразуем в числа
//       nodes.add(parseInt(edge.target));
//     });

//     const totalNodes = Math.max(...Array.from(nodes));

//     let bind = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));
//     let weight = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));

//     // 3. ИСПРАВЛЕНО: цикл по edges с правильными свойствами
//     edges.forEach(edge => {
//       // В React Flow свойства называются source и target
//       const fromNode = parseInt(edge.source);
//       const toNode = parseInt(edge.target);

//       // Вес мы сохраняли в data.weight в функции onConnect
//       const edgeWeight = edge.data?.weight || 0;

//       const i = fromNode - 1;
//       const j = toNode - 1;

//       if (i < 0 || j < 0) {
//         return; // Пропускаем некорректные индексы
//       }

//       // Заполняем симметрично (туда и обратно)
//       bind[i][j] = 1;
//       weight[i][j] = edgeWeight;

//       bind[j][i] = 1;
//       weight[j][i] = edgeWeight;
//     });

//     // 4. Отправляем запрос на сервер
//     try {
//       const response = await fetch('http://localhost:5001/api/calculate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           bind,
//           weight,
//           totalNodes
//         }),
//       });

//       if (!response.ok) throw new Error('Ошибка сети или сервера');

//       const result = await response.json();
//       setResultMatrix(result);

//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="app-container">
//       <div className="sidebar">
//         <h2>Управление</h2>
//         <p>Двойной клик: добавить точку.</p>
//         <button onClick={handleCalculate} className="calculate-btn">Рассчитать</button>
//         {error && <p className="error">{error}</p>}
//       </div>

//       {/* МЫ ПЕРЕНЕСЛИ onDoubleClick СЮДА 
//          Теперь клик слушает обычный HTML div, он никогда не выдаст ошибку "Unknown handler"
//       */}
//       <div
//         className="flow-wrapper"
//         ref={reactFlowWrapper}
//         onDoubleClick={handleWrapperDoubleClick}
//       >
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onInit={setReactFlowInstance}
//           fitView
//         // onPaneDoubleClick удален, так как он вызывает ошибку
//         >
//           <Controls />
//           <Background />
//         </ReactFlow>
//       </div>

//       {resultMatrix && (
//         <div className="result-matrix-container" style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', padding: 20, border: '1px solid black' }}>
//           {/* ... таблица результатов ... */}
//           <pre>{JSON.stringify(resultMatrix, null, 2)}</pre>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <ReactFlowProvider>
//       <FlowArea />
//     </ReactFlowProvider>
//   );
// }

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalculatorPage from './pages/calc/CalculatorPage';
import AuhtPage from './pages/auth/AuthPage';
import './App.css'; // Глобальные стили, если нужны

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="auth" element={<AuhtPage />} />
        <Route path="/" element={<CalculatorPage />} />

        {/* В будущем можно легко добавить другие страницы */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
      </Routes>
    </Router>
  );
}