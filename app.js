/**
 * Aplicación Principal - Simulador de Red Neuronal
 * Coordina la red neuronal, visualización y interfaz de usuario
 */
class NeuralNetworkApp {
    constructor() {
        // Inicializar componentes
        this.network = new NeuralNetwork();
        this.visualizer = new NetworkVisualizer('networkSvg', this.network);
        this.costChart = new CostChart('costChart');
        
        // Variables de control
        this.trainingInterval = null;
        this.isTraining = false;
        this.trainingSpeed = 100; // ms entre épocas
        
        // Inicializar interfaz
        this.initializeUI();
        this.updateDisplay();
        
        // Calcular salida inicial
        this.network.forwardPass();
        this.updateDisplay();
    }
    
    initializeUI() {
        // Referencias a elementos DOM
        this.elements = {
            learningRate: document.getElementById('learningRate'),
            learningRateValue: document.getElementById('learningRateValue'),
            targetOutput: document.getElementById('targetOutput'),
            activationFunction: document.getElementById('activationFunction'),
            startTraining: document.getElementById('startTraining'),
            pauseTraining: document.getElementById('pauseTraining'),
            resetNetwork: document.getElementById('resetNetwork'),
            stepByStep: document.getElementById('stepByStep'),
            epoch: document.getElementById('epoch'),
            currentError: document.getElementById('currentError'),
            currentOutput: document.getElementById('currentOutput'),
            weightsDisplay: document.getElementById('weightsDisplay'),
            calculationsDisplay: document.getElementById('calculationsDisplay')
        };
        
        // Event listeners
        this.setupEventListeners();
        
        // Inicializar valores
        this.elements.learningRateValue.textContent = this.elements.learningRate.value;
        this.network.setLearningRate(parseFloat(this.elements.learningRate.value));
        this.network.setTargetOutput(parseFloat(this.elements.targetOutput.value));
    }
    
    setupEventListeners() {
        // Control de tasa de aprendizaje
        this.elements.learningRate.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.elements.learningRateValue.textContent = value;
            this.network.setLearningRate(value);
        });
        
        // Control de salida objetivo
        this.elements.targetOutput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.network.setTargetOutput(value);
            this.network.forwardPass(); // Recalcular error
            this.updateDisplay();
        });
        
        // Control de función de activación
        this.elements.activationFunction.addEventListener('change', (e) => {
            this.network.setActivationFunction(e.target.value);
            this.network.forwardPass(); // Recalcular con nueva función
            this.updateDisplay();
        });
        
        // Botones de control
        this.elements.startTraining.addEventListener('click', () => this.startTraining());
        this.elements.pauseTraining.addEventListener('click', () => this.pauseTraining());
        this.elements.resetNetwork.addEventListener('click', () => this.resetNetwork());
        this.elements.stepByStep.addEventListener('click', () => this.stepByStep());
        
        // Teclas de acceso rápido\n        document.addEventListener('keydown', (e) => {\n            if (e.code === 'Space') {\n                e.preventDefault();\n                if (this.isTraining) {\n                    this.pauseTraining();\n                } else {\n                    this.startTraining();\n                }\n            } else if (e.code === 'KeyR') {\n                e.preventDefault();\n                this.resetNetwork();\n            } else if (e.code === 'KeyS') {\n                e.preventDefault();\n                this.stepByStep();\n            }\n        });\n    }\n    \n    startTraining() {\n        if (this.isTraining) return;\n        \n        this.isTraining = true;\n        this.elements.startTraining.disabled = true;\n        this.elements.pauseTraining.disabled = false;\n        \n        // Entrenar continuamente\n        this.trainingInterval = setInterval(() => {\n            this.network.trainStep();\n            this.updateDisplay();\n            \n            // Animar flujo de datos ocasionalmente\n            if (this.network.epoch % 10 === 0) {\n                this.visualizer.animateForwardPass();\n            }\n            \n            // Parar si el error es muy pequeño\n            if (this.network.error < 0.001) {\n                this.pauseTraining();\n                this.showMessage('¡Entrenamiento completado! Error < 0.001');\n            }\n        }, this.trainingSpeed);\n    }\n    \n    pauseTraining() {\n        this.isTraining = false;\n        this.elements.startTraining.disabled = false;\n        this.elements.pauseTraining.disabled = true;\n        \n        if (this.trainingInterval) {\n            clearInterval(this.trainingInterval);\n            this.trainingInterval = null;\n        }\n    }\n    \n    resetNetwork() {\n        this.pauseTraining();\n        this.network.reset();\n        this.costChart.reset();\n        this.updateDisplay();\n        this.showCalculations([{\n            step: 'Red Reiniciada',\n            formula: 'Pesos y bias restaurados a valores iniciales',\n            result: 'Listo para entrenar'\n        }]);\n    }\n    \n    stepByStep() {\n        this.pauseTraining();\n        this.network.trainStep();\n        this.updateDisplay();\n        this.visualizer.animateForwardPass();\n    }\n    \n    updateDisplay() {\n        // Actualizar estadísticas\n        this.elements.epoch.textContent = this.network.epoch;\n        this.elements.currentError.textContent = this.network.error.toFixed(6);\n        this.elements.currentOutput.textContent = this.network.output.toFixed(6);\n        \n        // Actualizar visualización de pesos\n        this.updateWeightsDisplay();\n        \n        // Actualizar visualizaciones\n        this.visualizer.update();\n        this.costChart.update(this.network.costHistory);\n        \n        // Mostrar cálculos si están disponibles\n        if (this.network.calculations.length > 0) {\n            this.showCalculations(this.network.calculations);\n        }\n    }\n    \n    updateWeightsDisplay() {\n        const weights = this.network.weights;\n        const biases = this.network.biases;\n        \n        const html = `\n            <div class=\"weights-section\">\n                <strong>Pesos:</strong><br>\n                w1: ${weights.w1.toFixed(3)} | w2: ${weights.w2.toFixed(3)}<br>\n                w3: ${weights.w3.toFixed(3)} | w4: ${weights.w4.toFixed(3)}<br>\n                w5: ${weights.w5.toFixed(3)} | w6: ${weights.w6.toFixed(3)}\n            </div>\n            <div class=\"biases-section\">\n                <strong>Bias:</strong><br>\n                b1: ${biases.b1.toFixed(3)} | b2: ${biases.b2.toFixed(3)} | b3: ${biases.b3.toFixed(3)}\n            </div>\n            <div class=\"activations-section\">\n                <strong>Activaciones:</strong><br>\n                Oculta 1: ${this.network.hiddenLayer[0].toFixed(3)}<br>\n                Oculta 2: ${this.network.hiddenLayer[1].toFixed(3)}<br>\n                Salida: ${this.network.output.toFixed(3)}\n            </div>\n        `;\n        \n        this.elements.weightsDisplay.innerHTML = html;\n    }\n    \n    showCalculations(calculations) {\n        let html = '<div class=\"calculations-content\">';\n        \n        calculations.forEach((calc, index) => {\n            html += `\n                <div class=\"calculation-step\">\n                    <div class=\"step-header\">📐 ${calc.step}</div>\n                    <div class=\"step-formula\">${calc.formula}</div>\n                    <div class=\"step-result\">${calc.result}</div>\n                    ${calc.activation ? `<div class=\"step-activation\">${calc.activation}</div>` : ''}\n                </div>\n            `;\n            \n            if (index < calculations.length - 1) {\n                html += '<hr style=\"margin: 10px 0; border: 1px solid #e2e8f0;\">';\n            }\n        });\n        \n        html += '</div>';\n        this.elements.calculationsDisplay.innerHTML = html;\n    }\n    \n    showMessage(message) {\n        // Crear notificación temporal\n        const notification = document.createElement('div');\n        notification.style.cssText = `\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            background: #48bb78;\n            color: white;\n            padding: 15px 20px;\n            border-radius: 10px;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n            z-index: 1000;\n            font-weight: 600;\n        `;\n        notification.textContent = message;\n        \n        document.body.appendChild(notification);\n        \n        setTimeout(() => {\n            notification.remove();\n        }, 3000);\n    }\n    \n    // Métodos para controlar la velocidad de entrenamiento\n    setTrainingSpeed(speed) {\n        this.trainingSpeed = speed;\n        if (this.isTraining) {\n            this.pauseTraining();\n            this.startTraining();\n        }\n    }\n}\n\n// Inicializar aplicación cuando el DOM esté listo\ndocument.addEventListener('DOMContentLoaded', () => {\n    // Verificar que todas las librerías estén cargadas\n    if (typeof d3 === 'undefined') {\n        console.error('D3.js no está cargado');\n        return;\n    }\n    \n    if (typeof Chart === 'undefined') {\n        console.error('Chart.js no está cargado');\n        return;\n    }\n    \n    // Inicializar aplicación\n    window.app = new NeuralNetworkApp();\n    \n    // Agregar información de ayuda\n    console.log('🧠 Simulador de Red Neuronal Iniciado');\n    console.log('Controles de teclado:');\n    console.log('  Espacio: Iniciar/Pausar entrenamiento');\n    console.log('  R: Reiniciar red');\n    console.log('  S: Paso a paso');\n    \n    // Mostrar mensaje de bienvenida\n    setTimeout(() => {\n        window.app.showMessage('¡Bienvenido al Simulador de Red Neuronal! 🧠');\n    }, 1000);\n});

