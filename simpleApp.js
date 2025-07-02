/**
 * Aplicación Principal Simplificada - Simulador de Red Neuronal
 * Sin dependencias externas, usando Canvas nativo
 */
class SimpleNeuralNetworkApp {
    constructor() {
        // Inicializar componentes
        this.network = new NeuralNetwork();
        this.visualizer = new SimpleNetworkVisualizer('networkCanvas', this.network);
        this.costChart = new SimpleCostChart('costCanvas');
        
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
        
        console.log('🧠 Simulador de Red Neuronal Iniciado (Versión Simplificada)');
        this.showMessage('¡Bienvenido al Simulador de Red Neuronal! 🧠');
    }
    
    initializeUI() {
        // Panel de ayuda teórica
        const helpPanel = document.getElementById('helpPanel');
        const openHelp = document.getElementById('openHelp');
        const closeHelp = document.getElementById('closeHelp');
        if (openHelp && helpPanel && closeHelp) {
            openHelp.addEventListener('click', () => {
                helpPanel.style.display = 'block';
            });
            closeHelp.addEventListener('click', () => {
                helpPanel.style.display = 'none';
            });
        }

        // Referencias a elementos
        this.elements = {
            learningRate: document.getElementById('learningRate'),
            learningRateValue: document.getElementById('learningRateValue'),
            inputX1: document.getElementById('inputX1'),
            inputX2: document.getElementById('inputX2'),
            costFunction: document.getElementById('costFunction'),
            targetOutput: document.getElementById('targetOutput'),
            activationFunction: document.getElementById('activationFunction'),
            weightW1: document.getElementById('weightW1'),
            weightW2: document.getElementById('weightW2'),
            weightW3: document.getElementById('weightW3'),
            weightW4: document.getElementById('weightW4'),
            weightW5: document.getElementById('weightW5'),
            weightW6: document.getElementById('weightW6'),
            biasB1: document.getElementById('biasB1'),
            biasB2: document.getElementById('biasB2'),
            biasB3: document.getElementById('biasB3'),
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
        
        // Inicializar entradas, función de costo, pesos y bias
        this.network.setInputs([
            parseFloat(this.elements.inputX1.value),
            parseFloat(this.elements.inputX2.value)
        ]);
        this.network.setCostFunction(this.elements.costFunction.value);
        this.setNetworkWeightsAndBiasesFromInputs();

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
        
        // Entradas x1 y x2
        this.elements.inputX1.addEventListener('input', (e) => {
            const x1 = parseFloat(e.target.value);
            const x2 = parseFloat(this.elements.inputX2.value);
            this.network.setInputs([x1, x2]);
            this.network.forwardPass();
            this.updateDisplay();
        });
        this.elements.inputX2.addEventListener('input', (e) => {
            const x1 = parseFloat(this.elements.inputX1.value);
            const x2 = parseFloat(e.target.value);
            this.network.setInputs([x1, x2]);
            this.network.forwardPass();
            this.updateDisplay();
        });

        // Función de costo
        this.elements.costFunction.addEventListener('change', (e) => {
            this.network.setCostFunction(e.target.value);
            this.network.forwardPass();
            this.updateDisplay();
        });

        // Pesos y bias iniciales
        [
            'weightW1','weightW2','weightW3','weightW4','weightW5','weightW6',
            'biasB1','biasB2','biasB3'
        ].forEach(key => {
            this.elements[key].addEventListener('input', () => {
                this.setNetworkWeightsAndBiasesFromInputs();
                this.network.forwardPass();
                this.updateDisplay();
            });
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
        
        // Teclas de acceso rápido
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isTraining) {
                    this.pauseTraining();
                } else {
                    this.startTraining();
                }
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.resetNetwork();
            } else if (e.code === 'KeyS') {
                e.preventDefault();
                this.stepByStep();
            }
        });
    }
    
    startTraining() {
        if (this.isTraining) return;
        
        this.isTraining = true;
        this.elements.startTraining.disabled = true;
        this.elements.pauseTraining.disabled = false;
        
        // Entrenar continuamente
        this.trainingInterval = setInterval(() => {
            this.network.trainStep();
            this.updateDisplay();
            
            // Animar flujo de datos ocasionalmente
            if (this.network.epoch % 10 === 0) {
                this.visualizer.animateForwardPass();
            }
            
            // Parar si el error es muy pequeño
            if (this.network.error < 0.001) {
                this.pauseTraining();
                this.showMessage('¡Entrenamiento completado! Error < 0.001');
            }
            
            // Parar si se alcanza un número máximo de épocas
            if (this.network.epoch > 10000) {
                this.pauseTraining();
                this.showMessage('Entrenamiento detenido: Máximo de épocas alcanzado');
            }
        }, this.trainingSpeed);
    }
    
    pauseTraining() {
        this.isTraining = false;
        this.elements.startTraining.disabled = false;
        this.elements.pauseTraining.disabled = true;
        
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
    }
    
    resetNetwork() {
        this.pauseTraining();
        this.network.reset();
        this.costChart.reset();
        this.updateDisplay();
        this.showCalculations([{
            step: 'Red Reiniciada',
            formula: 'Pesos y bias restaurados a valores iniciales',
            result: 'Listo para entrenar'
        }]);
        this.showMessage('Red neuronal reiniciada');
    }
    
    stepByStep() {
        this.pauseTraining();
        this.network.trainStep();
        this.updateDisplay();
        this.visualizer.animateForwardPass();
    }
    
    updateDisplay() {
        // Actualizar estadísticas
        this.elements.epoch.textContent = this.network.epoch;
        this.elements.currentError.textContent = this.network.error.toFixed(6);
        this.elements.currentOutput.textContent = this.network.output.toFixed(6);
        
        // Actualizar visualización de pesos
        this.updateWeightsDisplay();
        
        // Actualizar visualizaciones
        this.visualizer.update();
        this.costChart.update(this.network.costHistory);
        
        // Mostrar cálculos si están disponibles
        if (this.network.calculations.length > 0) {
            this.showCalculations(this.network.calculations);
        }
    }
    
    updateWeightsDisplay() {
        const weights = this.network.weights;
        const biases = this.network.biases;
        
        const html = `
            <div class="weights-section">
                <strong>Pesos:</strong><br>
                w1: ${weights.w1.toFixed(3)} | w2: ${weights.w2.toFixed(3)}<br>
                w3: ${weights.w3.toFixed(3)} | w4: ${weights.w4.toFixed(3)}<br>
                w5: ${weights.w5.toFixed(3)} | w6: ${weights.w6.toFixed(3)}
            </div>
            <div class="biases-section">
                <strong>Bias:</strong><br>
                b1: ${biases.b1.toFixed(3)} | b2: ${biases.b2.toFixed(3)} | b3: ${biases.b3.toFixed(3)}
            </div>
            <div class="activations-section">
                <strong>Activaciones:</strong><br>
                Oculta 1: ${this.network.hiddenLayer[0].toFixed(3)}<br>
                Oculta 2: ${this.network.hiddenLayer[1].toFixed(3)}<br>
                Salida: ${this.network.output.toFixed(3)}
            </div>
        `;
        
        this.elements.weightsDisplay.innerHTML = html;
    }
    
    showCalculations(calculations) {
        let html = '<div class="calculations-content">';
        
        calculations.forEach((calc, index) => {
            html += `
                <div class="calculation-step">
                    <div class="step-header"> ${calc.step}</div>
                    <div class="step-formula">${calc.formula}</div>
                    <div class="step-result">${calc.result}</div>
                    ${calc.activation ? `<div class="step-activation">${calc.activation}</div>` : ''}
                </div>
            `;
            
            if (index < calculations.length - 1) {
                html += '<hr style="margin: 10px 0; border: 1px solid #e2e8f0;">';
            }
        });
        
        html += '</div>';
        this.elements.calculationsDisplay.innerHTML = html;
    }
    
    setNetworkWeightsAndBiasesFromInputs() {
        // Actualiza los pesos y bias de la red neuronal desde los campos de la UI
        this.network.weights = {
            w1: parseFloat(this.elements.weightW1.value),
            w2: parseFloat(this.elements.weightW2.value),
            w3: parseFloat(this.elements.weightW3.value),
            w4: parseFloat(this.elements.weightW4.value),
            w5: parseFloat(this.elements.weightW5.value),
            w6: parseFloat(this.elements.weightW6.value)
        };
        this.network.biases = {
            b1: parseFloat(this.elements.biasB1.value),
            b2: parseFloat(this.elements.biasB2.value),
            b3: parseFloat(this.elements.biasB3.value)
        };
    }

    showMessage(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 600;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Métodos para controlar la velocidad de entrenamiento
    setTrainingSpeed(speed) {
        this.trainingSpeed = speed;
        if (this.isTraining) {
            this.pauseTraining();
            this.startTraining();
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que el canvas esté disponible
    const networkCanvas = document.getElementById('networkCanvas');
    const costCanvas = document.getElementById('costCanvas');
    
    if (!networkCanvas || !costCanvas) {
        console.error('Canvas elements not found');
        return;
    }
    
    // Inicializar aplicación
    try {
        window.app = new SimpleNeuralNetworkApp();
        
        // Agregar información de ayuda
        console.log('Controles de teclado:');
        console.log('  Espacio: Iniciar/Pausar entrenamiento');
        console.log('  R: Reiniciar red');
        console.log('  S: Paso a paso');
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});

