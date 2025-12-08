const express = require('express');
const cors = require('cors'); // Для связи между client и server

const app = express();
app.use(cors()); // Включаем CORS
app.use(express.json()); // Позволяет серверу читать JSON из запросов

// --- СЮДА КОПИРУЕМ ВАШИ ФУНКЦИИ АЛГОРИТМА ---
// (Я скопировал их из нашего предыдущего ответа)

function createMatrix(rows, cols, fillValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

function findMinOfMatrix(matrix) {
    let minValue = Infinity;
    let colIndex = -1;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] < minValue) {
                minValue = matrix[i][j];
                colIndex = matrix[i].length === 1 ? i : j; // Адаптация для min(min(P))
            }
        }
    }
    // В оригинале MATLAB min(min(P)) возвращал индекс столбца.
    // JS-версия findMinOfMatrix должна делать то же самое.
    // Давайте исправим ее, чтобы она точно соответствовала MATLAB
    let trueMin = Infinity;
    let trueColIndex = -1;
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] < trueMin) {
                trueMin = matrix[r][c];
                trueColIndex = c;
            }
        }
    }
    return { value: trueMin, colIndex: trueColIndex };
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

function algorithmOptim(bind, weight, A, B) {
    const totalNodes = A + B;
    // ... (Код нормализации, если нужен, НО front-end будет строить симметричную матрицу)
    // Нам нужно, чтобы front-end присылал уже готовую симметричную матрицу
    // ... поэтому код нормализации из MATLAB здесь не нужен.
    // НО, в вашем примере он был, так что давайте его тоже сделаем симметричным
    for (let i = 0; i < totalNodes; i++) {
        for (let j = 0; j < i; j++) {
            if (bind[j][i] === 1 && bind[i][j] === 0) {
                bind[i][j] = 1;
                weight[i][j] = weight[j][i];
            }
            if (bind[i][j] === 1 && bind[j][i] === 0) {
                bind[j][i] = 1;
                weight[j][i] = weight[i][j];
            }
        }
    }


    let result = createMatrix(totalNodes, totalNodes, 0);
    const infinity = 1e6;

    for (let i = 0; i < totalNodes; i++) {
        const state = {
            P: createMatrix(totalNodes, totalNodes, infinity),
            vi: [i],
            Pmin: infinity
        };

        for (let j = 0; j < totalNodes - 1; j++) {
            const currentNode = state.vi[j];

            // Исправляем логику perebir - он не должен менять Pmin
            const currentPmin = (j === 0) ? 0 : state.Pmin;

            // Обновленная логика perebir
            const totalNodes = A + B;
            for (let a = 0; a < totalNodes; a++) {
                if (bind[currentNode][a] === 1 && !state.vi.includes(a)) {
                    const newCost = weight[currentNode][a] + currentPmin;
                    // Обновляем P, только если нашли более короткий путь
                    if (newCost < state.P[currentNode][a]) {
                        state.P[currentNode][a] = newCost;
                    }
                }
            }

            const minInfo = findMinOfMatrix(state.P);
            if (minInfo.colIndex === -1 || minInfo.value === infinity) break;

            const nextNodeIndex = minInfo.colIndex;
            state.Pmin = minInfo.value; // Pmin - это мин. путь до *следующего* узла
            state.vi.push(nextNodeIndex);
            result[i][nextNodeIndex] = state.Pmin;

            for (let k = 0; k < totalNodes; k++) {
                state.P[k][nextNodeIndex] = infinity;
            }
        }
    }
    return result;
}
// --- КОНЕЦ КОПИРОВАНИЯ ФУНКЦИЙ ---


// Создаем API эндпоинт
app.post('/api/calculate', (req, res) => {
    try {
        // Получаем данные от React
        const { bind, weight, totalNodes } = req.body;

        // Запускаем ваш алгоритм
        // (Параметры A и B больше не нужны, используем totalNodes)
        const result = algorithmOptim(bind, weight, totalNodes, 0);
        console.log("Результат расчета:", result);

        // Отправляем результат обратно в React
        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка на сервере при расчете" });
    }
});

const PORT = 5001; // Используем порт 5001 (React обычно на 3000 или 5173)
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});