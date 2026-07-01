/**
 * generateMatrices(nodes, edges)
 *
 * Будує матриці суміжності (bind) та ваг (weight) для бек-енду.
 *
 * Приймає nodes, щоб:
 *  1. totalNodes завжди = nodes.length (не залежить від формату ID рёбер)
 *  2. Вузли без ребер теж враховуються
 *  3. Працює з будь-якими ID: числа, uuid, рядки — байдуже
 */
export const generateMatrices = (nodes, edges) => {
    if (!nodes || nodes.length === 0) {
        return { bind: [], weight: [], totalNodes: 0 };
    }

    const totalNodes = nodes.length;

    // Стабільне відображення id → порядковий індекс (0-based).
    // Сортуємо, щоб порядок був передбачуваним незалежно від порядку
    // в якому вузли були створені.
    const idToIndex = new Map();
    [...nodes]
        .sort((a, b) => {
            // Намагаємось числове сортування; якщо ID не числа — лексикографічне
            const na = parseFloat(a.id);
            const nb = parseFloat(b.id);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        })
        .forEach((node, idx) => {
            idToIndex.set(node.id, idx);
        });

    const bind = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));
    const weight = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));

    if (!edges || edges.length === 0) {
        return { bind, weight, totalNodes };
    }

    edges.forEach((edge) => {
        const u = idToIndex.get(edge.source);
        const v = idToIndex.get(edge.target);

        // Якщо source або target не знайдено серед вузлів — пропускаємо
        if (u === undefined || v === undefined || u === v) return;

        const w =
            edge.data?.weight !== undefined
                ? parseInt(edge.data.weight, 10)
                : parseInt(edge.label, 10) || 0;

        const dir = edge.data?.directionCode ?? 1;

        const minIndex = Math.min(u, v);
        const maxIndex = Math.max(u, v);

        let valToWrite;
        if (dir === 1) {
            // Двостороння
            valToWrite = 1;
        } else {
            const isForward = dir === 3;
            // valToWrite залежить від того, чи u < v (порядок у матриці)
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