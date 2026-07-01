// ============================================
// autoLayout.js
// Автоматичне розкладання графа за допомогою dagre.
// Розташуйте файл у src/utils/ (або де у вас MatrixHelpres.js)
// ============================================

import dagre from 'dagre';

// Приблизні розміри вузла. Точний розмір знати не можемо
// (він динамічний у SmartNode), тому беремо середні.
const DEFAULT_NODE_WIDTH = 140;
const DEFAULT_NODE_HEIGHT = 50;

/**
 * Розкладає граф за допомогою dagre.
 *
 * @param {Array} nodes      — поточні ноди reactflow
 * @param {Array} edges      — поточні ребра reactflow
 * @param {Object} [options] — налаштування
 * @param {'TB'|'BT'|'LR'|'RL'} [options.direction='TB']
 *        Напрямок: TB (зверху вниз), LR (ліворуч праворуч) тощо
 * @param {number} [options.nodeSeparation=60]  Відстань між сусідніми вузлами
 * @param {number} [options.rankSeparation=80]  Відстань між "рівнями"
 * @returns {{ nodes, edges }} — нові ноди/ребра з оновленими position
 */
export const getLayoutedElements = (nodes, edges, options = {}) => {
    const {
        direction = 'TB',
        nodeSeparation = 60,
        rankSeparation = 80,
    } = options;

    if (!nodes || nodes.length === 0) {
        return { nodes: nodes || [], edges: edges || [] };
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: nodeSeparation,
        ranksep: rankSeparation,
        marginx: 20,
        marginy: 20,
    });

    // Реєструємо вузли. Якщо у ноди вже відомі реальні розміри (width/height),
    // використовуємо їх — dagre тоді точніше розставляє.
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: node.width || DEFAULT_NODE_WIDTH,
            height: node.height || DEFAULT_NODE_HEIGHT,
        });
    });

    // Для dagre важливий напрямок, але в нашій схемі ребра можуть бути
    // двосторонніми/зворотними. Трактуємо всі як "від source до target"
    // — це нормально для первинного розкладання.
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const isHorizontal = direction === 'LR' || direction === 'RL';

    const layoutedNodes = nodes.map((node) => {
        const positioned = dagreGraph.node(node.id);
        if (!positioned) return node;

        // dagre повертає центр вузла; reactflow хоче лівий верхній кут
        const width = node.width || DEFAULT_NODE_WIDTH;
        const height = node.height || DEFAULT_NODE_HEIGHT;

        return {
            ...node,
            // targetPosition / sourcePosition лишаємо автоматичні,
            // оскільки наш SmartNode має порти тільки top/bottom
            position: {
                x: positioned.x - width / 2,
                y: positioned.y - height / 2,
            },
        };
    });

    return {
        nodes: layoutedNodes,
        edges,
        isHorizontal,
    };
};
