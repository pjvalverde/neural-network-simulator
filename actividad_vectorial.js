// Lógica de la actividad vectorial interactiva
// Autor: Data Scientist & Educador

// --- Parámetros de la función real ---
function realFunction(x1, x2) {
    switch(window._realFunctionType) {
        case 'cuadratica':
            return x1 * x1 + 2 * x2 + 1;
        case 'cuadratica2':
            return x1 * x1 - x2 * x2 + 1;
        case 'senoidal':
            return Math.sin(x1) + x2;
        case 'lineal':
        default:
            return 2 * x1 + 3 * x2 + 1;
    }
}

// Control dinámico de función real y sugerencia
function updateActivationSuggestion() {
    const select = document.getElementById('realFunctionSelect');
    const suggestion = document.getElementById('activationSuggestion');
    let msg = '';
    switch(select.value) {
        case 'lineal':
            msg = '<b>Sugerencia:</b> Usa activación lineal.';
            break;
        case 'cuadratica':
            msg = '<b>Sugerencia:</b> Prueba ReLU o tanh.';
            break;
        case 'cuadratica2':
            msg = '<b>Sugerencia:</b> Prueba tanh para funciones simétricas.';
            break;
        case 'senoidal':
            msg = '<b>Sugerencia:</b> Prueba tanh para funciones senoidales.';
            break;
        default:
            msg = '<b>Sugerencia:</b> Elige la activación según la función real.';
    }
    suggestion.innerHTML = msg;
}
document.addEventListener('DOMContentLoaded', () => {
    window._realFunctionType = 'lineal';
    const realFunctionSelect = document.getElementById('realFunctionSelect');
    realFunctionSelect.addEventListener('change', () => {
        window._realFunctionType = realFunctionSelect.value;
        updateActivationSuggestion();
        // Regenerar datos nuevos con la función seleccionada
        if (typeof generateData === 'function') {
            window._actividadVectorialData = generateData(30);
        }
        // Reiniciar inputs y gráficas
        if (typeof mseChart !== 'undefined') {
            mseChart.data.labels = [];
            mseChart.data.datasets[0].data = [];
            mseChart.update();
        }
        document.getElementById('resultado-numerico').style.display = 'none';
        document.getElementById('report-section') && (document.getElementById('report-section').style.display = 'none');
    });
    updateActivationSuggestion();
});

// --- Utilidades ---
function relu(x) {
    return Math.max(0, x);
}
function tanh(x) {
    return Math.tanh(x);
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
function nnPredict(x1, x2, W1, b1, W2, b2, activation) {
    // x1, x2: arrays (N)
    // W1: 2x2, b1: 2x1, W2: 1x2, b2: escalar
    let y_pred = [];
    for (let i = 0; i < x1.length; i++) {
        // Entrada
        let x = [x1[i], x2[i]]; // (2,)
        // Capa oculta: h = activation(W1·x + b1)
        let h = [0, 0];
        for (let j = 0; j < 2; j++) {
            h[j] = activation(W1[j][0]*x[0] + W1[j][1]*x[1] + b1[j]);
        }
        // Salida: y_pred = W2·h + b2
        let y = W2[0]*h[0] + W2[1]*h[1] + b2;
        y_pred.push(y);
    }
    return y_pred;
}

// --- Entrenamiento por descenso de gradiente (capa oculta) ---
async function trainModel(data, W1, b1, W2, b2, lr, epochs, onUpdate, activation, weightRange) {
    let { x1, x2, y } = data;
    let history = { mse: [], W1: [], b1: [], W2: [], b2: [] };
    for (let epoch = 0; epoch < epochs; epoch++) {
        // Forward
        let y_pred = nnPredict(x1, x2, W1, b1, W2, b2, activation);
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
                // Limitar W1
                if (W1[j][k] > weightRange) W1[j][k] = weightRange;
                if (W1[j][k] < -weightRange) W1[j][k] = -weightRange;
            }
            // Limitar b1
            if (b1[j] > 100) b1[j] = 100;
            if (b1[j] < -100) b1[j] = -100;
            // Limitar W2
            if (W2[j] > 100) W2[j] = 100;
            if (W2[j] < -100) W2[j] = -100;
        }
        b2 -= lr * db2;
        // Limitar b2
        if (b2 > 100) b2 = 100;
        if (b2 < -100) b2 = -100;
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
    const mseChartCtx = document.getElementById('mseChart').getContext('2d');
    let mseChart;

    // Control de nombre y habilitación de PDF
    const studentNameInput = document.getElementById('studentName');
    const reportBtn = document.getElementById('report-btn');
    let entrenado = false;
    function isNameValid(name) {
        return name && name.trim().split(' ').length >= 2;
    }
    function checkBtn() {
        reportBtn.disabled = !(isNameValid(studentNameInput.value) && entrenado);
    }
    studentNameInput.addEventListener('input', checkBtn);
    // Llama a esto justo después de entrenar
    function marcarEntrenado() {
        entrenado = true;
        checkBtn();
    }
    // Asegúrate de llamar a marcarEntrenado() al final del entrenamiento exitoso
    function isNameValid(name) {
        return name && name.trim().split(' ').length >= 2;
    }
    function checkReportBtn() {
        const name = studentNameInput.value.trim();
        reportBtn.disabled = !(isNameValid(name) && window._actividadVectorialReporte);
    }
    studentNameInput.addEventListener('input', () => {
        checkReportBtn();
    });
    // Llama también tras entrenar
    window._checkReportBtn = checkReportBtn;
    checkReportBtn();

    // Generación de PDF
    reportBtn.addEventListener('click', function() {
        const name = studentNameInput.value.trim();
        if (!isNameValid(name)) {
            alert('Por favor ingresa tu nombre y apellido antes de generar el PDF.');
            return;
        }
        if (!window._actividadVectorialReporte) {
            alert('Primero debes entrenar la red para generar el reporte.');
            return;
        }
        const r = window._actividadVectorialReporte;
        // jsPDF
        const doc = (window.jspdf && window.jspdf.jsPDF) ? new window.jspdf.jsPDF() : (window.jsPDF ? new window.jsPDF() : null);
        if (!doc) {
            alert('jsPDF no está cargado.');
            return;
        }
        let y = 14;
        doc.setFontSize(14);
        doc.text('Reporte de Simulación de Red Neuronal', 14, y);
        y += 10;
        doc.setFontSize(11);
        doc.text('Nombre: ' + (r.nombre || name), 14, y);
        y += 8;
        doc.text('Función real: ' + (r.funcionReal || ''), 14, y);
        y += 8;
        doc.text('Función de activación: ' + (r.activacion || ''), 14, y);
        y += 8;
        doc.text('Explicación:', 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(r.explicacion || '', 180), 14, y);
        y += 14;
        doc.setFontSize(11);
        doc.text('Resumen numérico:', 14, y);
        y += 7;
        doc.setFontSize(10);
        doc.text('MSE final: ' + (r.mse ? r.mse.toFixed(4) : ''), 14, y);
        y += 6;
        doc.text('Pesos finales W1: ' + JSON.stringify(r.W1), 14, y);
        y += 6;
        doc.text('Bias finales b1: ' + JSON.stringify(r.b1), 14, y);
        y += 6;
        doc.text('Pesos finales W2: ' + JSON.stringify(r.W2), 14, y);
        y += 6;
        doc.text('Bias final b2: ' + JSON.stringify(r.b2), 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.text('Comparación de las primeras 10 muestras:', 14, y);
        y += 7;
        doc.setFontSize(9);
        doc.text('i   x1   x2   Real   Predicho', 14, y);
        y += 5;
        for (let i = 0; i < 10 && i < r.real.length; i++) {
            const real = r.real[i];
            const pred = r.pred[i];
            doc.text(`${i}   ${real.x1}   ${real.x2}   ${real.y.toFixed(2)}   ${pred.y.toFixed(2)}`, 14, y);
            y += 5;
            if (y > 270) { doc.addPage(); y = 14; }
        }
        doc.save('reporte_red_neuronal.pdf');
    });

    // Habilita el botón de PDF solo si hay reporte y nombre válido
    function checkReportBtn() {
        reportBtn.disabled = !window._studentNameValid || !window._actividadVectorialReporte;
    }
    // Actualiza cada vez que se entrena
    window._checkReportBtn = checkReportBtn;

    // Datos
    window._actividadVectorialData = generateData(30);
    const data = window._actividadVectorialData;

    // Inicializa gráfica de MSE
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
        // Limitar a los valores permitidos
        if (![0.001, 0.005, 0.01, 0.05].includes(lr)) lr = 0.05;
        // Leer epochs
        let epochs = parseInt(document.getElementById('epochs').value) || 120;
        // Leer rango de pesos
        let weightRange = parseInt(document.getElementById('weightRange').value) || 100;
        // Leer función de activación
        let activationType = document.getElementById('activationSelect').value;
        function activation(x) {
            if (activationType === 'lineal') return x;
            if (activationType === 'relu') return relu(x);
            if (activationType === 'tanh') return tanh(x);
            return x;
        }
        // Inicializa solo la gráfica de MSE y oculta el resumen numérico
        document.getElementById('resultado-numerico').style.display = 'none';
        mseChart.data.labels = [];
        mseChart.data.datasets[0].data = [];
        mseChart.update();
        // Entrena
        // Usa los datos actuales según la función seleccionada
        const dataActual = window._actividadVectorialData || data;
        let history = await trainModel(dataActual, W1, b1, W2, b2v, lr, epochs, (epoch, y_pred, loss) => {
            mseChart.data.labels.push(epoch);
            mseChart.data.datasets[0].data.push(loss);
            mseChart.update();
        }, activation, weightRange);

        // Habilita reporte
        window._checkReportBtn && window._checkReportBtn();
        trainBtn.disabled = false;
        // Guardar x1, x2, y real y predicho para el reporte (sin usar ninguna gráfica)
        const y_pred_final = nnPredict(dataActual.x1, dataActual.x2, W1, b1, W2, b2v, activation);
        const realArr = dataActual.x1.map((xi, i) => ({ x1: dataActual.x1[i], x2: dataActual.x2[i], y: dataActual.y[i] }));
        const predArr = y_pred_final.map((yp, i) => ({ x1: dataActual.x1[i], x2: dataActual.x2[i], y: yp }));
        // Explicación didáctica según función y activación
        let explicacion = '';
        if (window._realFunctionType === 'lineal' && activationType === 'lineal') {
            explicacion = 'La función real es lineal y la activación también. La red puede aprender perfectamente.';
        } else if (window._realFunctionType === 'lineal') {
            explicacion = 'La función real es lineal, pero se usó una activación no lineal. Aun así, la red puede aproximar, pero no es necesario.';
        } else if ((window._realFunctionType === 'cuadratica' || window._realFunctionType === 'cuadratica2') && activationType === 'tanh') {
            explicacion = 'La función real es no lineal y simétrica. La activación tanh permite a la red aprender relaciones no lineales y negativas.';
        } else if ((window._realFunctionType === 'cuadratica' || window._realFunctionType === 'cuadratica2') && activationType === 'relu') {
            explicacion = 'La función real es no lineal. ReLU ayuda a aprender funciones no lineales positivas, pero puede limitar la simetría.';
        } else if (window._realFunctionType === 'senoidal' && activationType === 'tanh') {
            explicacion = 'La función real es senoidal. La activación tanh es ideal para aprender funciones suaves y oscilatorias.';
        } else {
            explicacion = 'La combinación de función real y activación seleccionada puede afectar la capacidad de la red para aprender. Experimenta distintas combinaciones.';
        }
        window._actividadVectorialReporte = {
            nombre: window._studentName || '',
            funcionReal: document.getElementById('realFunctionSelect').selectedOptions[0].text,
            activacion: document.getElementById('activationSelect').selectedOptions[0].text,
            explicacion: explicacion,
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
        const lucroRealProm = dataActual.y.reduce((a, b) => a + b, 0) / dataActual.y.length;
        const lucroPredProm = y_pred_final.reduce((a, b) => a + b, 0) / y_pred_final.length;
        let resumen = `<b>Lucro real promedio:</b> ${lucroRealProm.toFixed(2)}<br>` +
                      `<b>Lucro predicho promedio:</b> ${lucroPredProm.toFixed(2)}<br>` +
                      `<b>Pesos y bias finales:</b><br>` +
                      `W1: [[${W1[0][0].toFixed(2)}, ${W1[0][1].toFixed(2)}], [${W1[1][0].toFixed(2)}, ${W1[1][1].toFixed(2)}]]<br>` +
                      `b1: [${b1[0].toFixed(2)}, ${b1[1].toFixed(2)}]<br>` +
                      `W2: [${W2[0].toFixed(2)}, ${W2[1].toFixed(2)}]<br>` +
                      `b2: ${b2v.toFixed(2)}<br>` +
                      `<b>Epochs usados:</b> ${epochs}<br>` +
                      `<b>MSE final:</b> ${history.mse[history.mse.length-1].toFixed(4)}`;
        // Tabla comparativa de los primeros 10 valores
        let tabla = `<br><b>Comparación de las primeras 10 muestras:</b>`;
        tabla += `<table style='border-collapse:collapse;margin-top:8px;font-size:0.97em;'>`;
        tabla += `<tr style='background:#f7fafc;'><th style='border:1px solid #ccc;padding:3px;'>Índice</th><th style='border:1px solid #ccc;padding:3px;'>x₁</th><th style='border:1px solid #ccc;padding:3px;'>x₂</th><th style='border:1px solid #ccc;padding:3px;'>Lucro real</th><th style='border:1px solid #ccc;padding:3px;'>Lucro predicho</th></tr>`;
        for (let i = 0; i < Math.min(10, data.x1.length); i++) {
            tabla += `<tr>`;
            tabla += `<td style='border:1px solid #ccc;padding:3px;'>${i}</td>`;
            tabla += `<td style='border:1px solid #ccc;padding:3px;'>${data.x1[i]}</td>`;
            tabla += `<td style='border:1px solid #ccc;padding:3px;'>${data.x2[i]}</td>`;
            tabla += `<td style='border:1px solid #ccc;padding:3px;'>${data.y[i].toFixed(2)}</td>`;
            tabla += `<td style='border:1px solid #ccc;padding:3px;'>${y_pred_final[i].toFixed(2)}</td>`;
            tabla += `</tr>`;
        }
        tabla += `</table>`;
        document.getElementById('resumen-numerico').innerHTML = resumen + tabla;
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
