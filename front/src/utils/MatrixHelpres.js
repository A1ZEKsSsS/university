export const generateMatrices = (edges) => {
    // 1. Проверки на наличие данных
    if (!edges || edges.length === 0) {
        // Возвращаем пустые структуры, чтобы не ломать UI ошибками
        return { bind: [], weight: [], totalNodes: 0 };
    }

    // 2. Вычисляем размер матрицы (ищем самый большой ID)
    let maxId = 0;
    edges.forEach(edge => {
        const s = parseInt(edge.source);
        const t = parseInt(edge.target);
        if (!isNaN(s) && s > maxId) maxId = s;
        if (!isNaN(t) && t > maxId) maxId = t;
    });

    const totalNodes = maxId;

    // 3. Создаем пустые матрицы, заполненные нулями
    let bind = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));
    let weight = Array.from({ length: totalNodes }, () => Array(totalNodes).fill(0));

    // 4. Заполняем данными
    edges.forEach(edge => {
        // ReactFlow использует ID строк '1', '2'. Превращаем в индексы 0, 1.
        const u = parseInt(edge.source) - 1;
        const v = parseInt(edge.target) - 1;

        if (isNaN(u) || isNaN(v) || u < 0 || v < 0) return;

        // Получаем вес и направление из UI
        const w = edge.data?.weight !== undefined ? parseInt(edge.data.weight) : (parseInt(edge.label) || 0);
        const dir = edge.data?.directionCode || 1; // 1 = <->, 3 = ->, 2 = <-

        // Находим ячейку в "верхнем треугольнике" матрицы (где row < col)
        // Бекенд читает именно её.
        const minIndex = Math.min(u, v);
        const maxIndex = Math.max(u, v);

        let valToWrite = 1; // По умолчанию двусторонняя

        if (dir === 1) {
            valToWrite = 1;
        } else {
            // Логика конвертации: UI (Source->Target) ==> Matrix (Small->Big или Big->Small)

            const isForward = (dir === 3); // Пользователь хочет Source -> Target

            if (u < v) {
                // Source меньше Target (например, 0 -> 1).
                // Если Forward (0->1), нам нужен код 2 (Small->Big).
                // Если Reverse (1->0), нам нужен код 3 (Big->Small).
                valToWrite = isForward ? 2 : 3;
            } else {
                // Source больше Target (например, 1 -> 0).
                // Если Forward (1->0), нам нужен код 3 (Big->Small).
                // Если Reverse (0->1), нам нужен код 2 (Small->Big).
                valToWrite = isForward ? 3 : 2;
            }
        }

        // Записываем только в [min][max], бекенд сам отзеркалит остальное
        bind[minIndex][maxIndex] = valToWrite;
        weight[minIndex][maxIndex] = w;
    });

    return { bind, weight, totalNodes };
};