// src/utils/matrixHelpers.js

export const generateMatrices = (edges) => {
    if (edges.length === 0) {
        throw new Error("Добавьте хотя бы одну связь");
    }

    const nodeIndices = new Set();
    edges.forEach(edge => {
        nodeIndices.add(parseInt(edge.source));
        nodeIndices.add(parseInt(edge.target));
    });

    const totalNodes = Math.max(...Array.from(nodeIndices));

    // Создаем пустые матрицы
    let bind = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));
    let weight = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));

    edges.forEach(edge => {
        const fromNode = parseInt(edge.source);
        const toNode = parseInt(edge.target);
        const edgeWeight = edge.data?.weight || 0;

        const i = fromNode - 1;
        const j = toNode - 1;

        if (i >= 0 && j >= 0) {
            // Симметричное заполнение
            bind[i][j] = 1;
            weight[i][j] = edgeWeight;
            bind[j][i] = 1;
            weight[j][i] = edgeWeight;
        }
    });

    return { bind, weight, totalNodes };
};