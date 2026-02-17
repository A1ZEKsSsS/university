// Вспомогательная функция для создания пустой матрицы
function createMatrix(rows, cols, fillValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

/**
 * 1. Нормализация направлений (как в MATLAB функции normalizeDirections_local)
 * Логика типов связей:
 * 0 - нет связи
 * 1 - двусторонняя (i <-> j)
 * 2 - обратная (j -> i)
 * 3 - прямая (i -> j)
 */
function normalizeDirections(rawBind, rawWeight, n) {
    // Создаем копии, чтобы не мутировать входные данные напрямую
    let bind = rawBind.map(row => [...row]);
    let weight = rawWeight.map(row => [...row]);

    // Проходимся, как в MATLAB скрипте, анализируя связи
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            const val = rawBind[j][i]; // Смотрим значение в "нижнем треугольнике" (или как пришло с фронта)

            if (val === 0) {
                // Нет связи
                bind[i][j] = 0;
                bind[j][i] = 0;
                weight[i][j] = 0;
                weight[j][i] = 0;
            } else if (val === 1) {
                // Двусторонняя
                bind[i][j] = 1;
                bind[j][i] = 1;
                // Вес одинаковый в обе стороны
                weight[i][j] = weight[j][i];
                // weight[j][i] уже имеет значение
            } else if (val === 2) {
                // j -> i (значит i -> j запрещено)
                bind[j][i] = 1;
                bind[i][j] = 0;
                weight[i][j] = 0;
                // weight[j][i] оставляем как есть
            } else if (val === 3) {
                // i -> j (значит j -> i запрещено)
                bind[j][i] = 0;
                bind[i][j] = 1;
                weight[i][j] = weight[j][i]; // Переносим вес
                weight[j][i] = 0;
            }
        }
    }
    return { bind, weight };
}

/**
 * Рекурсивное восстановление всех путей (Backtracking)
 * Аналог функции backtrack_local из MATLAB
 */
function buildAllPaths(currNode, startNode, predAll, pathSuffix, results, maxPaths = 1000) {
    // Если дошли до старта - путь найден
    if (currNode === startNode) {
        // Добавляем startNode в начало пути и сохраняем
        results.push([startNode, ...pathSuffix]);
        return;
    }

    if (results.length >= maxPaths) return;

    // Получаем список родителей для текущей точки
    const parents = predAll[currNode];

    if (!parents || parents.length === 0) return;

    for (const p of parents) {
        // Защита от циклов (если родитель уже есть в хвосте пути)
        if (pathSuffix.includes(p)) continue;

        // Рекурсивный вызов для родителя
        buildAllPaths(p, startNode, predAll, [currNode, ...pathSuffix], results, maxPaths);
    }
}

function algorithmOptim(rawBind, rawWeight, A, B = 0) {
    const totalNodes = A + B || rawBind.length;
    const INF = 1e12; // Большое число как в MATLAB
    const TOL = 1e-9; // Допуск для сравнения float

    // 1. Приводим матрицу к понямному виду (кто куда может ехать)
    const { bind, weight } = normalizeDirections(rawBind, rawWeight, totalNodes);

    // Инициализация матриц результатов
    // distAll[i][j] = минимальное расстояние от i до j
    const distAll = createMatrix(totalNodes, totalNodes, INF);

    // predAll[startNode][targetNode] = массив родителей targetNode при движении от startNode
    // Это 3D структура: массив массивов массивов.
    const predAll = Array.from({ length: totalNodes }, () =>
        Array.from({ length: totalNodes }, () => [])
    );

    // pathsAll[i][j] = массив всех возможных кратчайших маршрутов
    const pathsAll = createMatrix(totalNodes, totalNodes, null);

    // Обнуляем диагональ расстояний
    for (let i = 0; i < totalNodes; i++) distAll[i][i] = 0;

    // 2. Запускаем Дейкстру для каждой вершины как стартовой
    for (let s = 0; s < totalNodes; s++) {
        const dist = Array(totalNodes).fill(INF);
        dist[s] = 0;
        const visited = Array(totalNodes).fill(false);

        // Локальные родители для текущего старта s
        // preds[v] хранит список узлов, из которых можно попасть в v с минимальной стоимостью
        const preds = Array.from({ length: totalNodes }, () => []);

        // Цикл поиска кратчайших путей
        for (let i = 0; i < totalNodes; i++) {
            // а) Находим не посещенную вершину с минимальным dist
            let u = -1;
            let bestDist = INF;
            for (let k = 0; k < totalNodes; k++) {
                if (!visited[k] && dist[k] < bestDist) {
                    bestDist = dist[k];
                    u = k;
                }
            }

            if (u === -1 || dist[u] === INF) break; // Все достижимые вершины пройдены
            visited[u] = true;

            // б) Релаксация соседей
            for (let v = 0; v < totalNodes; v++) {
                // Если есть связь и вес положительный
                if (bind[u][v] === 1 && weight[u][v] > 0) {
                    const newCost = dist[u] + weight[u][v];

                    // Сценарий 1: Нашли БОЛЕЕ короткий путь
                    if (newCost < dist[v] - TOL) {
                        dist[v] = newCost;
                        preds[v] = [u]; // Забываем старых родителей, записываем нового
                    }
                    // Сценарий 2: Нашли ТАКОЙ ЖЕ по длине путь (альтернатива)
                    else if (Math.abs(newCost - dist[v]) <= TOL) {
                        // Добавляем альтернативного родителя, если его там нет
                        if (!preds[v].includes(u)) {
                            preds[v].push(u);
                        }
                    }
                }
            }
        }

        // Сохраняем результаты для строки s
        distAll[s] = dist;
        for (let v = 0; v < totalNodes; v++) {
            predAll[s][v] = preds[v];
        }
    }

    // 3. Восстанавливаем маршруты на основе родителей (Backtracking)
    for (let s = 0; s < totalNodes; s++) {
        for (let t = 0; t < totalNodes; t++) {
            if (s === t) {
                // Путь в самого себя
                pathsAll[s][t] = [[s]];
                continue;
            }
            if (distAll[s][t] >= INF / 2) {
                // Пути нет
                pathsAll[s][t] = [];
                continue;
            }

            const foundPaths = [];
            // s - старт, t - цель, predAll[s] - дерево родителей для этого старта
            // Передаем пустой suffix, так как buildAllPaths начнет с конца (t)
            buildAllPaths(t, s, predAll[s], [], foundPaths);

            pathsAll[s][t] = foundPaths;
        }
    }

    // Возвращаем объект, как требует фронтенд
    return {
        dist: distAll,
        paths: pathsAll
    };
}

module.exports = { algorithmOptim };