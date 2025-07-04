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

// --- Red neuronal simple (1 capa, pesos y bias vectoriales, ReLU) ---
function nnPredict(x1, x2, weights, bias) {
    // x1, x2: arrays
    // weights, bias: arrays de 3 elementos
    let y_pred = [];
    for (let i = 0; i < x1.length; i++) {
        // Simula: y = relu(w1*x1 + w2*x2 + w3*1 + b1 + b2 + b3)
        let z = weights[0]*x1[i] + weights[1]*x2[i] + weights[2]*1 + bias[0] + bias[1] + bias[2];
        y_pred.push(relu(z));
    }
    return y_pred;
}

// --- Entrenamiento por descenso de gradiente ---
async function trainModel(data, weights, bias, lr, epochs, onUpdate) {
    let { x1, x2, y } = data;
    let history = { mse: [], weights: [], bias: [] };
    for (let epoch = 0; epoch < epochs; epoch++) {
        // Forward
        let y_pred = nnPredict(x1, x2, weights, bias);
        let loss = mse(y, y_pred);
        history.mse.push(loss);
        history.weights.push([...weights]);
        history.bias.push([...bias]);
        if (onUpdate && epoch % 10 === 0) onUpdate(epoch, y_pred, loss, weights, bias);
        // Backprop (derivadas analíticas)
        let grad_w = [0, 0, 0];
        let grad_b = [0, 0, 0];
        for (let i = 0; i < x1.length; i++) {
            let z = weights[0]*x1[i] + weights[1]*x2[i] + weights[2]*1 + bias[0] + bias[1] + bias[2];
            let dz = z > 0 ? 1 : 0; // Derivada de ReLU
            let err = (nnPredict([x1[i]], [x2[i]], weights, bias)[0] - y[i]);
            grad_w[0] += 2 * err * x1[i] * dz;
            grad_w[1] += 2 * err * x2[i] * dz;
            grad_w[2] += 2 * err * 1 * dz;
            grad_b[0] += 2 * err * dz;
            grad_b[1] += 2 * err * dz;
            grad_b[2] += 2 * err * dz;
        }
        // Promedio
        grad_w = grad_w.map(g => g / x1.length);
        grad_b = grad_b.map(g => g / x1.length);
        // Actualiza
        for (let j = 0; j < 3; j++) {
            weights[j] -= lr * grad_w[j];
            bias[j] -= lr * grad_b[j];
        }
        // Simula animación
        await new Promise(res => setTimeout(res, 8));
    }
    return history;
}

// --- UI ---
document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const pesoInputs = [
        document.getElementById('peso1'),
        document.getElementById('peso2'),
        document.getElementById('peso3'),
    ];
    const biasInputs = [
        document.getElementById('bias1'),
        document.getElementById('bias2'),
        document.getElementById('bias3'),
    ];
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
        // Lee inputs
        let weights = pesoInputs.map(inp => parseFloat(inp.value));
        let bias = biasInputs.map(inp => parseFloat(inp.value));
        let lr = parseFloat(lrInput.value);
        let epochs = 120;
        // Gráfica real
        profitChart.data.datasets[0].data = data.x1.map((x, i) => ({ x: x, y: data.y[i] }));
        profitChart.data.datasets[1].data = [];
        profitChart.update();
        mseChart.data.labels = [];
        mseChart.data.datasets[0].data = [];
        mseChart.update();
        // Entrena
        let history = await trainModel(data, weights, bias, lr, epochs, (epoch, y_pred, loss) => {
            // Actualiza predicción
            profitChart.data.datasets[1].data = data.x1.map((x, i) => ({ x: x, y: y_pred[i] }));
            profitChart.update();
            // Actualiza MSE
            mseChart.data.labels.push(epoch);
            mseChart.data.datasets[0].data.push(loss);
            mseChart.update();
        });
        // Habilita reporte
        reportBtn.disabled = false;
        trainBtn.disabled = false;
        // Guarda datos para reporte
        window._actividadVectorialReporte = {
            pesos: pesoInputs.map(inp => parseFloat(inp.value)),
            bias: biasInputs.map(inp => parseFloat(inp.value)),
            lr: lrInput.value,
            mse: history.mse[history.mse.length-1],
            pred: profitChart.data.datasets[1].data,
            real: profitChart.data.datasets[0].data
        };
    });

    // Reporte (placeholder, PDF en siguiente etapa)
    reportBtn.addEventListener('click', () => {
        const rep = window._actividadVectorialReporte;
        if (!rep) return;
        let html = `<b>Pesos iniciales:</b> [${rep.pesos.join(', ')}]<br>` +
                   `<b>Bias iniciales:</b> [${rep.bias.join(', ')}]<br>` +
                   `<b>Tasa de aprendizaje:</b> ${rep.lr}<br>` +
                   `<b>MSE final:</b> ${rep.mse.toFixed(4)}<br>`;
        document.getElementById('report-summary').innerHTML = html;
        document.getElementById('report-section').style.display = '';
    });
});
