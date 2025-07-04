// Lógica de la actividad vectorial interactiva
// Autor: Data Scientist & Educador

// --- Parámetros de la función real ---
function realFunction(x1, x2) {
    // Ejemplo: lucro = 2*x1 + 3*x2 + 1
    return 2 * x1 + 3 * x2 + 1;
}

// --- Utilidades ---
function relu(x) {
    return Math.max(0, x);
}

function mse(y_true, y_pred) {
    let sum = 0;
    for (let i = 0; i < y_true.length; i++) {
        sum += Math.pow(y_true[i] - y_pred[i], 2);
    }
    return sum / y_true.length;
}

// --- Genera datos de ejemplo ---
function generateData(n = 30) {
    let x1 = [], x2 = [], y = [];
    for (let i = 0; i < n; i++) {
        let xi1 = Math.round(Math.random() * 10);
        let xi2 = Math.round(Math.random() * 10);
        x1.push(xi1);
        x2.push(xi2);
        y.push(realFunction(xi1, xi2));
    }
    return { x1, x2, y };
}

// --- Red neuronal con capa oculta (2 neuronas ocultas, 1 salida) ---
function nnPredict(x1, x2, W1, b1, W2, b2) {
    // x1, x2: arrays (N)
    // W1: 2x2, b1: 2x1, W2: 1x2, b2: escalar
    let y_pred = [];
    for (let i = 0; i < x1.length; i++) {
        // Entrada
        let x = [x1[i], x2[i]]; // (2,)
        // Capa oculta: h = relu(W1·x + b1)
        let h = [0, 0];
        for (let j = 0; j < 2; j++) {
            h[j] = relu(W1[j][0]*x[0] + W1[j][1]*x[1] + b1[j]);
        }
        // Salida: y_pred = W2·h + b2
        let y = W2[0]*h[0] + W2[1]*h[1] + b2;
        y_pred.push(y);
    }
    return y_pred;
}

// --- Entrenamiento por descenso de gradiente (capa oculta) ---
async function trainModel(data, W1, b1, W2, b2, lr, epochs, onUpdate) {
    let { x1, x2, y } = data;
    let history = { mse: [], W1: [], b1: [], W2: [], b2: [] };
    for (let epoch = 0; epoch < epochs; epoch++) {
        // Forward
        let y_pred = nnPredict(x1, x2, W1, b1, W2, b2);
        let loss = mse(y, y_pred);
        history.mse.push(loss);
        history.W1.push(JSON.parse(JSON.stringify(W1)));
        history.b1.push([...b1]);
        history.W2.push([...W2]);
        history.b2.push(b2);
        if (onUpdate && epoch % 10 === 0) onUpdate(epoch, y_pred, loss, W1, b1, W2, b2);
        // Gradientes acumulados
        let dW1 = [[0,0],[0,0]];
        let db1 = [0,0];
        let dW2 = [0,0];
        let db2 = 0;
        for (let i = 0; i < x1.length; i++) {
            // Forward individual
            let x = [x1[i], x2[i]];
            // Capa oculta
            let z1 = [W1[0][0]*x[0] + W1[0][1]*x[1] + b1[0], W1[1][0]*x[0] + W1[1][1]*x[1] + b1[1]];
            let h = [relu(z1[0]), relu(z1[1])];
            // Salida
            let y_hat = W2[0]*h[0] + W2[1]*h[1] + b2;
            let err = y_hat - y[i];
            // Gradiente salida
            dW2[0] += 2 * err * h[0];
            dW2[1] += 2 * err * h[1];
            db2    += 2 * err;
            // Gradiente capa oculta
            for (let j = 0; j < 2; j++) {
                let dh = W2[j] * 2 * err;
                let dz = z1[j] > 0 ? 1 : 0;
                db1[j] += dh * dz;
                dW1[j][0] += dh * dz * x[0];
                dW1[j][1] += dh * dz * x[1];
            }
        }
        // Promedio
        dW2 = dW2.map(g => g / x1.length);
        db2 = db2 / x1.length;
        db1 = db1.map(g => g / x1.length);
        dW1 = dW1.map(row => row.map(g => g / x1.length));
        // Actualiza
        for (let j = 0; j < 2; j++) {
            W2[j] -= lr * dW2[j];
            b1[j] -= lr * db1[j];
            for (let k = 0; k < 2; k++) {
                W1[j][k] -= lr * dW1[j][k];
            }
        }
        b2 -= lr * db2;
        // Simula animación
        await new Promise(res => setTimeout(res, 8));
    }
    return history;
}

// --- UI ---
document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    // W1: 2x2
    const w1_11 = document.getElementById('w1_11');
    const w1_12 = document.getElementById('w1_12');
    const w1_21 = document.getElementById('w1_21');
    const w1_22 = document.getElementById('w1_22');
    // b1: 2x1
    const b1_1 = document.getElementById('b1_1');
    const b1_2 = document.getElementById('b1_2');
    // W2: 1x2
    const w2_1 = document.getElementById('w2_1');
    const w2_2 = document.getElementById('w2_2');
    // b2: 1x1
    const b2 = document.getElementById('b2');
    const lrInput = document.getElementById('learningRate');
    const trainBtn = document.getElementById('train-btn');
    const reportBtn = document.getElementById('report-btn');
    const profitChartCtx = document.getElementById('profitChart').getContext('2d');
    const mseChartCtx = document.getElementById('mseChart').getContext('2d');
    let profitChart, mseChart;

    // Datos
    const data = generateData(30);

    // Inicializa gráficas vacías
    profitChart = new Chart(profitChartCtx, {
        type: 'scatter',
        data: {
            datasets: [
                { label: 'Lucro Real', data: [], backgroundColor: '#48bb78' },
                { label: 'Predicción', data: [], backgroundColor: '#667eea' }
            ]
        },
        options: {
            scales: { x: { title: { display: true, text: 'x₁ (Laptops vendidas)' } }, y: { title: { display: true, text: 'Lucro' } } },
            plugins: { legend: { position: 'top' } }
        }
    });
    mseChart = new Chart(mseChartCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'MSE', data: [], borderColor: '#e53e3e', fill: false }] },
        options: { scales: { x: { title: { display: true, text: 'Época' } }, y: { title: { display: true, text: 'MSE' } } } }
    });

    // Entrenamiento interactivo
    trainBtn.addEventListener('click', async () => {
        trainBtn.disabled = true;
        reportBtn.disabled = true;
        // Lee inputs nuevos
        let W1 = [
            [parseFloat(w1_11.value), parseFloat(w1_12.value)],
            [parseFloat(w1_21.value), parseFloat(w1_22.value)]
        ];
        let b1 = [parseFloat(b1_1.value), parseFloat(b1_2.value)];
        let W2 = [parseFloat(w2_1.value), parseFloat(w2_2.value)];
        let b2v = parseFloat(b2.value);
        let lr = parseFloat(lrInput.value);
        let epochs = 120;
        // Ocultar gráfica de lucro real vs predicción (ya no se usa)
        document.getElementById('resultado-numerico').style.display = 'none';
        mseChart.data.labels = [];
        mseChart.data.datasets[0].data = [];
        mseChart.update();
        // Entrena
        let history = await trainModel(data, W1, b1, W2, b2v, lr, epochs, (epoch, y_pred, loss) => {
            // Actualiza predicción (eje X = índice de muestra)
            profitChart.data.datasets[1].data = y_pred.map((y, i) => ({ x: i, y: y }));
            profitChart.update();
            // Actualiza MSE
            mseChart.data.labels.push(epoch);
            mseChart.data.datasets[0].data.push(loss);
            mseChart.update();
        });
        // Habilita reporte
        reportBtn.disabled = false;
        trainBtn.disabled = false;
        // Guardar x1, x2, y real y predicho para el reporte
        const realArr = data.x1.map((xi, i) => ({ x1: data.x1[i], x2: data.x2[i], y: data.y[i] }));
        const predArr = history.W2[history.W2.length-1].map((yp, i) => ({ x1: data.x1[i], x2: data.x2[i], y: yp }));
        window._actividadVectorialReporte = {
            W1: JSON.parse(JSON.stringify(W1)),
            b1: [...b1],
            W2: [...W2],
            b2: b2v,
            lr: lrInput.value,
            mse: history.mse[history.mse.length-1],
            pred: predArr,
            real: realArr
        };
        // Mostrar resultados numéricos
        const lucroRealProm = data.y.reduce((a, b) => a + b, 0) / data.y.length;
        const lucroPredProm = history.W2[history.W2.length-1].reduce((a, b) => a + b, 0) / history.W2[history.W2.length-1].length;
        let resumen = `<b>Lucro real promedio:</b> ${lucroRealProm.toFixed(2)}<br>` +
                      `<b>Lucro predicho promedio:</b> ${lucroPredProm.toFixed(2)}<br>` +
                      `<b>Pesos y bias finales:</b><br>` +
                      `W1: [[${W1[0][0].toFixed(2)}, ${W1[0][1].toFixed(2)}], [${W1[1][0].toFixed(2)}, ${W1[1][1].toFixed(2)}]]<br>` +
                      `b1: [${b1[0].toFixed(2)}, ${b1[1].toFixed(2)}]<br>` +
                      `W2: [${W2[0].toFixed(2)}, ${W2[1].toFixed(2)}]<br>` +
                      `b2: ${b2v.toFixed(2)}<br>` +
                      `<b>Epochs usados:</b> ${epochs}<br>` +
                      `<b>MSE final:</b> ${history.mse[history.mse.length-1].toFixed(4)}`;
        document.getElementById('resumen-numerico').innerHTML = resumen;
        document.getElementById('resultado-numerico').style.display = '';
    });

    // Reporte (placeholder, PDF en siguiente etapa)
    reportBtn.addEventListener('click', () => {
        const rep = window._actividadVectorialReporte;
        if (!rep) return;
        let html = `<b>W1 (entrada→oculta):</b><br>` +
                   `[${rep.W1[0][0].toFixed(2)}, ${rep.W1[0][1].toFixed(2)}]<br>` +
                   `[${rep.W1[1][0].toFixed(2)}, ${rep.W1[1][1].toFixed(2)}]<br>` +
                   `<b>b1 (bias oculta):</b> [${rep.b1.map(v=>v.toFixed(2)).join(', ')}]<br>` +
                   `<b>W2 (oculta→salida):</b> [${rep.W2.map(v=>v.toFixed(2)).join(', ')}]<br>` +
                   `<b>b2 (bias salida):</b> ${rep.b2.toFixed(2)}<br>` +
                   `<b>Tasa de aprendizaje:</b> ${rep.lr}<br>` +
                   `<b>MSE final:</b> ${rep.mse.toFixed(4)}<br>`;
        // Tabla comparativa de las primeras 10 muestras
        if (rep.real && rep.pred && rep.real.length > 0 && rep.pred.length > 0) {
            html += `<br><b>Comparación de las primeras 10 muestras:</b>`;
            html += `<table style='border-collapse:collapse;margin-top:8px;font-size:0.97em;'>`;
            html += `<tr style='background:#f7fafc;'><th style='border:1px solid #ccc;padding:3px;'>Índice</th><th style='border:1px solid #ccc;padding:3px;'>x₁</th><th style='border:1px solid #ccc;padding:3px;'>x₂</th><th style='border:1px solid #ccc;padding:3px;'>Lucro real</th><th style='border:1px solid #ccc;padding:3px;'>Lucro predicho</th></tr>`;
            for (let i = 0; i < Math.min(10, rep.real.length); i++) {
                html += `<tr>`;
                html += `<td style='border:1px solid #ccc;padding:3px;'>${i}</td>`;
                html += `<td style='border:1px solid #ccc;padding:3px;'>${rep.real[i].x1 !== undefined ? rep.real[i].x1 : '-'}</td>`;
                html += `<td style='border:1px solid #ccc;padding:3px;'>${rep.real[i].x2 !== undefined ? rep.real[i].x2 : '-'}</td>`;
                html += `<td style='border:1px solid #ccc;padding:3px;'>${rep.real[i].y.toFixed(2)}</td>`;
                html += `<td style='border:1px solid #ccc;padding:3px;'>${rep.pred[i].y.toFixed(2)}</td>`;
                html += `</tr>`;
            }
            html += `</table>`;
        }
        document.getElementById('report-summary').innerHTML = html;
        document.getElementById('report-section').style.display = '';
    });
});
