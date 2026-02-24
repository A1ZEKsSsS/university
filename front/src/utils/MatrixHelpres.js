export const generateMatrices = (edges) => {
    if (!edges || edges.length === 0) {
        return { bind: [], weight: [], totalNodes: 0 };
    }

    let maxId = 0;
    edges.forEach(edge => {
        const s = parseInt(edge.source);
        const t = parseInt(edge.target);
        if (!isNaN(s) && s > maxId) maxId = s;
        if (!isNaN(t) && t > maxId) maxId = t;
    });

    const totalNodes = maxId;

    let bind = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));
    let weight = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));

    edges.forEach(edge => {
        const u = parseInt(edge.source) - 1;
        const v = parseInt(edge.target) - 1;

        if (isNaN(u) || isNaN(v) || u < 0 || v < 0) return;

        const w = edge.data?.weight !== undefined ? parseInt(edge.data.weight) : (parseInt(edge.label) || 0);
        const dir = edge.data?.directionCode || 1;

        const minIndex = Math.min(u, v);
        const maxIndex = Math.max(u, v);

        let valToWrite = 1;

        if (dir === 1) {
            valToWrite = 1;
        } else {
            const isForward = (dir === 3);

            if (u < v) {
                valToWrite = isForward ? 2 : 3;
            } else {
                valToWrite = isForward ? 3 : 2;
            }
        }

        bind[minIndex][maxIndex] = valToWrite;
        weight[minIndex][maxIndex] = w;
    });

    return { bind, weight, totalNodes };
};