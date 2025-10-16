// --- Вспомогательные функции (без изменений) ---

function createMatrix(rows, cols, fillValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

function findMinOfMatrix(matrix) {
    let minValue = Infinity;
    let rowIndex = -1;
    let colIndex = -1;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] < minValue) {
                minValue = matrix[i][j];
                rowIndex = i;
                colIndex = j;
            }
        }
    }
    return { value: minValue, rowIndex, colIndex };
}

function perebir(state, currentNode, stepIndex, A, B, bind, weight) {
    const totalNodes = A + B;
    for (let a = 0; a < totalNodes; a++) {
        if (bind[currentNode][a] === 1 && !state.vi.includes(a)) {
            if (stepIndex === 0) {
                state.P[currentNode][a] = weight[currentNode][a];
            } else {
                state.P[currentNode][a] = weight[currentNode][a] + state.Pmin;
            }
        }
    }
}

// --- Основная функция (без изменений) ---

function algorithmOptim(bind, weight, A, B) {
    const totalNodes = A + B;

    // Часть 1: Нормализация матриц (преобразование в неориентированный граф)
    // Этот шаг важен, так как ваши исходные матрицы описывают ориентированный граф,
    // а итоговая таблица расстояний — симметрична (для неориентированного).
    for (let i = 0; i < totalNodes; i++) {
        for (let j = 0; j < i; j++) {
            if (bind[j][i] === 1) { // Если есть путь j -> i
                bind[i][j] = 1;      // Создаем симметричный путь i -> j
                weight[i][j] = weight[j][i];
            }
        }
    }

    let result = createMatrix(totalNodes, totalNodes, 0);
    const infinity = 1e6;

    // Часть 2: Основной алгоритм Дейкстры для каждой вершины
    for (let i = 0; i < totalNodes; i++) {
        const state = {
            P: createMatrix(totalNodes, totalNodes, infinity),
            vi: [i],
            Pmin: infinity
        };

        for (let j = 0; j < totalNodes - 1; j++) {
            const currentNode = state.vi[j];
            perebir(state, currentNode, j, A, B, bind, weight);
            const minInfo = findMinOfMatrix(state.P);
            if (minInfo.colIndex === -1) continue; // Если больше нет доступных путей

            const nextNodeIndex = minInfo.colIndex;
            state.Pmin = minInfo.value;
            state.vi.push(nextNodeIndex);
            result[i][nextNodeIndex] = state.Pmin;

            for (let k = 0; k < totalNodes; k++) {
                state.P[k][nextNodeIndex] = infinity;
            }
        }
    }
    return result;
}

// --- Пример использования с вашими данными ---

// В графе 10 вершин. A+B должно быть 10.
const A = 10;
const B = 0;

// Матрица связей из вашей документации
let bind = [
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Матрица весов из вашей документации
let weight = [
    [0, 3, 7, 5, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 4, 6, 0, 0, 0, 0, 0],
    [0, 0, 0, 10, 0, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 9, 5, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 4, 9, 0, 0],
    [0, 0, 0, 0, 0, 0, 9, 0, 4, 0],
    [0, 0, 0, 0, 0, 0, 0, 7, 10, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 11, 5],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Вызов функции
const finalResult = algorithmOptim(bind, weight, A, B);

// Вывод результата
console.log("Матрица кратчайших расстояний, рассчитанная кодом:");
finalResult.forEach(row => {
    // .map(v => v === 0 ? '-' : v) - для форматирования как в таблице
    console.log(row.join('\t'));
});