
function createMatrix(rows, cols, fillValue) {
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
}


function normalizeDirections(rawBind, rawWeight, n) {

    let bind = rawBind.map(row => [...row]);
    let weight = rawWeight.map(row => [...row]);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            const val = rawBind[j][i];

            if (val === 0) {
                bind[i][j] = 0;
                bind[j][i] = 0;
                weight[i][j] = 0;
                weight[j][i] = 0;
            } else if (val === 1) {
                bind[i][j] = 1;
                bind[j][i] = 1;
                weight[i][j] = weight[j][i];
            } else if (val === 2) {
                bind[j][i] = 1;
                bind[i][j] = 0;
                weight[i][j] = 0;
            } else if (val === 3) {
                bind[j][i] = 0;
                bind[i][j] = 1;
                weight[i][j] = weight[j][i];
                weight[j][i] = 0;
            }
        }
    }
    return { bind, weight };
}

function buildAllPaths(currNode, startNode, predAll, pathSuffix, results, maxPaths = 1000) {
    if (currNode === startNode) {
        results.push([startNode, ...pathSuffix]);
        return;
    }

    if (results.length >= maxPaths) return;

    const parents = predAll[currNode];

    if (!parents || parents.length === 0) return;

    for (const p of parents) {
        if (pathSuffix.includes(p)) continue;

        buildAllPaths(p, startNode, predAll, [currNode, ...pathSuffix], results, maxPaths);
    }
}

function algorithmOptim(rawBind, rawWeight, A, B = 0) {
    const totalNodes = A + B || rawBind.length;
    const INF = 1e12;
    const TOL = 1e-9;

    const { bind, weight } = normalizeDirections(rawBind, rawWeight, totalNodes);

    const distAll = createMatrix(totalNodes, totalNodes, INF);
    const predAll = Array.from({ length: totalNodes }, () =>
        Array.from({ length: totalNodes }, () => [])
    );

    const pathsAll = createMatrix(totalNodes, totalNodes, null);

    for (let i = 0; i < totalNodes; i++) distAll[i][i] = 0;

    for (let s = 0; s < totalNodes; s++) {
        const dist = Array(totalNodes).fill(INF);
        dist[s] = 0;
        const visited = Array(totalNodes).fill(false);
        const preds = Array.from({ length: totalNodes }, () => []);

        for (let i = 0; i < totalNodes; i++) {
            let u = -1;
            let bestDist = INF;
            for (let k = 0; k < totalNodes; k++) {
                if (!visited[k] && dist[k] < bestDist) {
                    bestDist = dist[k];
                    u = k;
                }
            }

            if (u === -1 || dist[u] === INF) break;
            visited[u] = true;

            for (let v = 0; v < totalNodes; v++) {
                if (bind[u][v] === 1 && weight[u][v] > 0) {
                    const newCost = dist[u] + weight[u][v];

                    if (newCost < dist[v] - TOL) {
                        dist[v] = newCost;
                        preds[v] = [u];
                    }
                    else if (Math.abs(newCost - dist[v]) <= TOL) {
                        if (!preds[v].includes(u)) {
                            preds[v].push(u);
                        }
                    }
                }
            }
        }

        distAll[s] = dist;
        for (let v = 0; v < totalNodes; v++) {
            predAll[s][v] = preds[v];
        }
    }

    for (let s = 0; s < totalNodes; s++) {
        for (let t = 0; t < totalNodes; t++) {
            if (s === t) {
                pathsAll[s][t] = [[s]];
                continue;
            }
            if (distAll[s][t] >= INF / 2) {
                pathsAll[s][t] = [];
                continue;
            }

            const foundPaths = [];
            buildAllPaths(t, s, predAll[s], [], foundPaths);

            pathsAll[s][t] = foundPaths;
        }
    }

    return {
        dist: distAll,
        paths: pathsAll
    };
}

module.exports = { algorithmOptim };