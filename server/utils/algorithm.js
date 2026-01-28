function createMatrix(rows, cols, fillValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}

function findMinOfMatrix(matrix) {
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

function algorithmOptim(bind, weight, A, B) {
    const totalNodes = A + B;

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
            const currentPmin = (j === 0) ? 0 : state.Pmin;

            for (let a = 0; a < totalNodes; a++) {
                if (bind[currentNode][a] === 1 && !state.vi.includes(a)) {
                    const newCost = weight[currentNode][a] + currentPmin;
                    if (newCost < state.P[currentNode][a]) {
                        state.P[currentNode][a] = newCost;
                    }
                }
            }

            const minInfo = findMinOfMatrix(state.P);
            if (minInfo.colIndex === -1 || minInfo.value === infinity) break;

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

module.exports = { algorithmOptim };