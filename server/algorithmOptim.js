// algorithmOptim.js
function algorithmOptim(bind, weight, A, B) {
    let r = Array.from({ length: A + B }, () => Array(A + B).fill(0));

    for (let i = 0; i < A + B; i++) {
        for (let j = 0; j <= i; j++) {
            if (bind[j][i] === 0) {
                bind[i][j] = 0;
                weight[i][j] = 0;
            } else if (bind[j][i] === 1) {
                bind[i][j] = 1;
                weight[i][j] = weight[j][i];
            } else if (bind[j][i] === 2) {
                bind[j][i] = 1;
                bind[i][j] = 0;
                weight[i][j] = 0;
            } else if (bind[j][i] === 3) {
                bind[j][i] = 0;
                bind[i][j] = 1;
                weight[i][j] = weight[j][i];
                weight[j][i] = 0;
            }
        }
    }

    let P = [];
    let vi = [];
    let Pmin = 0;

    function perebir(x1, x2, x3, x4, x5, x6) {
        for (let a = 0; a < x3 + x4; a++) {
            if (x5[x1][a] === 1 && !vi.includes(a)) {
                if (x2 === 1) {
                    P[x1][a] = x6[x1][a];
                } else {
                    P[x1][a] = x6[x1][a] + Pmin;
                }
            }
        }
    }

    for (let i = 0; i < A + B; i++) {
        vi = [i];
        P = Array.from({ length: A + B }, () => Array(A + B).fill(1e6));
        Pmin = 1e6;

        for (let j = 0; j < A + B - 1; j++) {
            perebir(vi[j], j + 1, A, B, bind, weight);

            let minVal = 1e6;
            let minPos = -1;
            for (let row = 0; row < P.length; row++) {
                for (let col = 0; col < P[row].length; col++) {
                    if (P[row][col] < minVal) {
                        minVal = P[row][col];
                        minPos = col;
                    }
                }
            }

            Pmin = minVal;
            vi.push(minPos);
            r[i][minPos] = Pmin;

            for (let k = 0; k < P.length; k++) {
                P[k][minPos] = 1e6;
            }
        }
    }

    return r;
}

module.exports = algorithmOptim;
