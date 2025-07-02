/**
 * Clase para simular la Red Neuronal con Gradient Descent
 * Basada en la arquitectura mostrada en la imagen
 */
class NeuralNetwork {
    constructor() {
        // Inicializar con los valores de la imagen
        this.inputs = [1, 0];
        this.targetOutput = 0.8;
        
        // Pesos iniciales (según la imagen)
        this.weights = {
            w1: 1,      // entrada 1 → neurona 1
            w2: 0.5,    // entrada 0 → neurona 1  
            w3: 1,      // entrada 1 → neurona 2
            w4: -0.5,   // entrada 0 → neurona 2
            w5: 1,      // neurona 1 → neurona 3
            w6: 1       // neurona 2 → neurona 3
        };
        
        // Bias iniciales (según la imagen)
        this.biases = {
            b1: 0.5,    // bias neurona 1
            b2: 0,      // bias neurona 2
            b3: 0.5     // bias neurona 3
        };
        
        // Variables para el entrenamiento
        this.learningRate = 0.1;
        this.activationFunction = 'sigmoid';
        this.epoch = 0;
        this.costHistory = [];
        this.isTraining = false;
        
        // Variables para almacenar valores intermedios
        this.hiddenLayer = [0, 0];
        this.output = 0;
        this.error = 0;
        
        // Para cálculos paso a paso
        this.stepByStepMode = false;
        this.calculations = [];
    }
    
    /**
     * Funciones de activación
     */
    activate(x, func = this.activationFunction) {
        switch(func) {
            case 'sigmoid':
                return 1 / (1 + Math.exp(-x));
            case 'tanh':
                return Math.tanh(x);
            case 'relu':
                return Math.max(0, x);
            default:
                return 1 / (1 + Math.exp(-x));
        }
    }
    
    /**
     * Derivadas de las funciones de activación
     */
    activateDerivative(x, func = this.activationFunction) {
        switch(func) {
            case 'sigmoid':
                const sigmoid = this.activate(x, 'sigmoid');
                return sigmoid * (1 - sigmoid);
            case 'tanh':
                const tanh = this.activate(x, 'tanh');
                return 1 - tanh * tanh;
            case 'relu':
                return x > 0 ? 1 : 0;
            default:
                const sig = this.activate(x, 'sigmoid');
                return sig * (1 - sig);
        }
    }
    
    /**
     * Forward Pass - Propagación hacia adelante
     */
    forwardPass() {
        this.calculations = [];
        
        // Cálculo de la capa oculta
        // Neurona 1
        const z1 = this.inputs[0] * this.weights.w1 + this.inputs[1] * this.weights.w2 + this.biases.b1;
        this.hiddenLayer[0] = this.activate(z1);
        
        this.calculations.push({
            step: 'Neurona Oculta 1',
            formula: `z1 = (${this.inputs[0]} × ${this.weights.w1.toFixed(3)}) + (${this.inputs[1]} × ${this.weights.w2.toFixed(3)}) + ${this.biases.b1.toFixed(3)}`,
            result: `z1 = ${z1.toFixed(3)}`,
            activation: `a1 = ${this.activationFunction}(${z1.toFixed(3)}) = ${this.hiddenLayer[0].toFixed(3)}`
        });
        
        // Neurona 2
        const z2 = this.inputs[0] * this.weights.w3 + this.inputs[1] * this.weights.w4 + this.biases.b2;
        this.hiddenLayer[1] = this.activate(z2);
        
        this.calculations.push({
            step: 'Neurona Oculta 2',
            formula: `z2 = (${this.inputs[0]} × ${this.weights.w3.toFixed(3)}) + (${this.inputs[1]} × ${this.weights.w4.toFixed(3)}) + ${this.biases.b2.toFixed(3)}`,
            result: `z2 = ${z2.toFixed(3)}`,
            activation: `a2 = ${this.activationFunction}(${z2.toFixed(3)}) = ${this.hiddenLayer[1].toFixed(3)}`
        });
        
        // Cálculo de la salida
        const z3 = this.hiddenLayer[0] * this.weights.w5 + this.hiddenLayer[1] * this.weights.w6 + this.biases.b3;
        this.output = this.activate(z3);
        
        this.calculations.push({
            step: 'Neurona de Salida',
            formula: `z3 = (${this.hiddenLayer[0].toFixed(3)} × ${this.weights.w5.toFixed(3)}) + (${this.hiddenLayer[1].toFixed(3)} × ${this.weights.w6.toFixed(3)}) + ${this.biases.b3.toFixed(3)}`,
            result: `z3 = ${z3.toFixed(3)}`,
            activation: `output = ${this.activationFunction}(${z3.toFixed(3)}) = ${this.output.toFixed(3)}`
        });
        
        // Cálculo del error
        this.error = 0.5 * Math.pow(this.targetOutput - this.output, 2);
        
        this.calculations.push({
            step: 'Función de Costo',
            formula: `Error = 0.5 × (target - output)²`,
            result: `Error = 0.5 × (${this.targetOutput} - ${this.output.toFixed(3)})² = ${this.error.toFixed(6)}`
        });
        
        return this.output;
    }
    
    /**
     * Backward Pass - Retropropagación
     */
    backwardPass() {
        // Gradientes para la capa de salida
        const outputError = this.output - this.targetOutput;
        const outputDelta = outputError * this.activateDerivative(this.output);
        
        this.calculations.push({
            step: 'Gradiente Capa de Salida',
            formula: `δ3 = (output - target) × σ'(output)`,
            result: `δ3 = (${this.output.toFixed(3)} - ${this.targetOutput}) × ${this.activateDerivative(this.output).toFixed(3)} = ${outputDelta.toFixed(6)}`
        });
        
        // Gradientes para los pesos de salida
        const dW5 = outputDelta * this.hiddenLayer[0];
        const dW6 = outputDelta * this.hiddenLayer[1];
        const dB3 = outputDelta;
        
        this.calculations.push({
            step: 'Gradientes Pesos de Salida',
            formula: `dW5 = δ3 × a1, dW6 = δ3 × a2, dB3 = δ3`,
            result: `dW5 = ${dW5.toFixed(6)}, dW6 = ${dW6.toFixed(6)}, dB3 = ${dB3.toFixed(6)}`
        });
        
        // Gradientes para la capa oculta
        const hidden1Error = outputDelta * this.weights.w5;
        const hidden2Error = outputDelta * this.weights.w6;
        
        const hidden1Delta = hidden1Error * this.activateDerivative(this.hiddenLayer[0]);
        const hidden2Delta = hidden2Error * this.activateDerivative(this.hiddenLayer[1]);
        
        this.calculations.push({
            step: 'Gradientes Capa Oculta',
            formula: `δ1 = δ3 × w5 × σ'(a1), δ2 = δ3 × w6 × σ'(a2)`,
            result: `δ1 = ${hidden1Delta.toFixed(6)}, δ2 = ${hidden2Delta.toFixed(6)}`
        });
        
        // Gradientes para los pesos de entrada
        const dW1 = hidden1Delta * this.inputs[0];
        const dW2 = hidden1Delta * this.inputs[1];
        const dW3 = hidden2Delta * this.inputs[0];
        const dW4 = hidden2Delta * this.inputs[1];
        const dB1 = hidden1Delta;
        const dB2 = hidden2Delta;
        
        this.calculations.push({
            step: 'Gradientes Pesos de Entrada',
            formula: `dW1 = δ1 × input1, dW2 = δ1 × input2, etc.`,
            result: `dW1 = ${dW1.toFixed(6)}, dW2 = ${dW2.toFixed(6)}, dW3 = ${dW3.toFixed(6)}, dW4 = ${dW4.toFixed(6)}`
        });
        
        // Actualizar pesos y bias
        this.weights.w1 -= this.learningRate * dW1;
        this.weights.w2 -= this.learningRate * dW2;
        this.weights.w3 -= this.learningRate * dW3;
        this.weights.w4 -= this.learningRate * dW4;
        this.weights.w5 -= this.learningRate * dW5;
        this.weights.w6 -= this.learningRate * dW6;
        
        this.biases.b1 -= this.learningRate * dB1;
        this.biases.b2 -= this.learningRate * dB2;
        this.biases.b3 -= this.learningRate * dB3;
        
        this.calculations.push({
            step: 'Actualización de Pesos',
            formula: `w_new = w_old - α × dW`,
            result: `Pesos actualizados con α = ${this.learningRate}`
        });
    }
    
    /**
     * Entrenar un paso
     */
    trainStep() {
        this.forwardPass();
        this.backwardPass();
        this.epoch++;
        this.costHistory.push(this.error);
        
        // Limitar el historial para rendimiento
        if (this.costHistory.length > 1000) {
            this.costHistory.shift();
        }
    }
    
    /**
     * Entrenar múltiples épocas
     */
    train(epochs = 1) {
        for (let i = 0; i < epochs; i++) {
            this.trainStep();
        }
    }
    
    /**
     * Reiniciar la red
     */
    reset() {
        this.weights = {
            w1: 1, w2: 0.5, w3: 1, w4: -0.5, w5: 1, w6: 1
        };
        this.biases = {
            b1: 0.5, b2: 0, b3: 0.5
        };
        this.epoch = 0;
        this.costHistory = [];
        this.calculations = [];
        this.forwardPass(); // Calcular salida inicial
    }
    
    /**
     * Obtener estado actual de la red
     */
    getState() {
        return {
            weights: {...this.weights},
            biases: {...this.biases},
            hiddenLayer: [...this.hiddenLayer],
            output: this.output,
            error: this.error,
            epoch: this.epoch,
            costHistory: [...this.costHistory],
            calculations: [...this.calculations]
        };
    }
    
    /**
     * Configurar parámetros
     */
    setLearningRate(rate) {
        this.learningRate = Math.max(0.001, Math.min(1, rate));
    }
    
    setTargetOutput(target) {
        this.targetOutput = Math.max(0, Math.min(1, target));
    }
    
    setActivationFunction(func) {
        this.activationFunction = func;
    }
    
    setInputs(inputs) {
        this.inputs = [...inputs];
    }
}

