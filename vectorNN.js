/**
 * Implementación de una Red Neuronal con entradas y salidas vectoriales
 * Basado en la implementación Python proporcionada en la actividad
 */

/**
 * Genera datos para entrenamiento basados en operaciones lógicas AND y OR
 * con ruido gaussiano en las entradas
 * @param {number} n - Número de muestras a generar
 * @param {number} noise - Desviación estándar del ruido
 * @param {number} seed - Semilla para el generador de números aleatorios
 * @returns {Object} - Objeto con arrays X e Y para entrenamiento
 */
function generateLogicDataset(n = 100, noise = 0.05, seed = 1) {
    // Inicializar generador de números aleatorios
    const rng = new Random(seed);
    
    // Datos base - operaciones lógicas AND y OR
    const baseData = [
        {x1: 1, x2: 0, y1: 0, y2: 1},  // AND = 0, OR = 1
        {x1: 0, x2: 1, y1: 0, y2: 1},  // AND = 0, OR = 1
        {x1: 1, x2: 1, y1: 1, y2: 1},  // AND = 1, OR = 1
        {x1: 0, x2: 0, y1: 0, y2: 0},  // AND = 0, OR = 0
    ];
    
    // Crear matrices para X e Y
    // X: [2, n], Y: [2, n]
    const X = [[], []];
    const Y = [[], []];
    
    // Generar n muestras
    for (let i = 0; i < n; i++) {
        // Seleccionar datos base al azar
        const baseIdx = Math.floor(rng.next() * 4);
        const base = baseData[baseIdx];
        
        // Añadir ruido a las entradas
        const x1 = base.x1 + rng.normal(0, noise);
        const x2 = base.x2 + rng.normal(0, noise);
        
        // Añadir a los arrays
        X[0].push(x1);
        X[1].push(x2);
        
        // Las salidas se mantienen como valores lógicos sin ruido
        Y[0].push(base.y1);
        Y[1].push(base.y2);
    }
    
    return { X, Y };
}

// Utilidades para generación de números aleatorios
class Random {
    // Implementación simple de un generador de números pseudoaleatorios
    constructor(seed = Date.now()) {
        this.seed = seed;
    }
    
    // Genera un número aleatorio entre 0 y 1
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    // Genera un número con distribución normal
    // Usando el método de Box-Muller
    normal(mean = 0, stddev = 1) {
        const u1 = this.next();
        const u2 = this.next();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + z0 * stddev;
    }
}

/**
 * Funciones de activación y sus derivadas
 */
const Activation = {
    relu: {
        forward: x => Math.max(0, x),
        backward: x => x > 0 ? 1 : 0
    },
    sigmoid: {
        forward: x => 1 / (1 + Math.exp(-x)),
        backward: x => {
            const s = 1 / (1 + Math.exp(-x));
            return s * (1 - s);
        }
    },
    tanh: {
        forward: x => Math.tanh(x),
        backward: x => 1 - Math.pow(Math.tanh(x), 2)
    }
};

/**
 * Implementación de la Red Neuronal con entradas y salidas vectoriales
 */
class VectorNN {
    constructor(config = {}) {
        // Parámetros de configuración con valores por defecto
        this.config = {
            inputDim: config.inputDim || 2,
            hiddenDims: config.hiddenDims || [2],  // Array para soportar múltiples capas ocultas
            outputDim: config.outputDim || 2,
            learningRate: config.learningRate || 0.05,
            activation: config.activation || 'relu',
            seed: config.seed || 1
        };
        
        // Inicializar generador de números aleatorios
        this.rng = new Random(this.config.seed);
        
        // Inicializar pesos y bias
        this.initializeParameters();
        
        // Historial de entrenamiento
        this.lossHistory = [];
        this.epoch = 0;
        this.trainStartTime = 0;
        this.trainEndTime = 0;
        
        // Almacenar valores intermedios durante el forward/backward pass
        this.cache = {
            Z: [],  // Valores pre-activación
            A: []   // Valores post-activación (incluye entrada X)
        };
    }
    
    // Inicializar pesos y bias con distribución normal
    initializeParameters() {
        this.weights = [];
        this.biases = [];
        
        let prevDim = this.config.inputDim;
        
        // Crear pesos y bias para cada capa oculta
        for (const hiddenDim of this.config.hiddenDims) {
            this.weights.push(this.createMatrix(hiddenDim, prevDim));
            this.biases.push(this.createVector(hiddenDim));
            prevDim = hiddenDim;
        }
        
        // Crear pesos y bias para la capa de salida
        this.weights.push(this.createMatrix(this.config.outputDim, prevDim));
        this.biases.push(this.createVector(this.config.outputDim));
    }
    
    // Crear una matriz de pesos inicializada aleatoriamente
    createMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                // Inicializar con distribución normal
                row.push(this.rng.normal(0, 0.1));
            }
            matrix.push(row);
        }
        return matrix;
    }
    
    // Crear un vector de bias inicializado aleatoriamente
    createVector(size) {
        const vector = [];
        for (let i = 0; i < size; i++) {
            vector.push(this.rng.normal(0, 0.1));
        }
        return vector;
    }
    
    // Forward pass - Propagación hacia adelante
    forward(X) {
        // X tiene dimensiones [inputDim, m] donde m es el número de ejemplos
        const m = X[0].length;
        
        // Resetear cache
        this.cache = {
            Z: [],
            A: [X]  // A[0] = X (entrada)
        };
        
        // Función para obtener la activación seleccionada
        const activation = Activation[this.config.activation].forward;
        
        // Propagar a través de cada capa
        let A_prev = X;
        const numLayers = this.weights.length;
        
        for (let l = 0; l < numLayers; l++) {            
            // Z[l] = W[l] @ A[l-1] + b[l]
            const Z = this.matrixMultiply(this.weights[l], A_prev);
            
            // Añadir bias a cada columna
            for (let i = 0; i < Z.length; i++) {
                for (let j = 0; j < Z[i].length; j++) {
                    Z[i][j] += this.biases[l][i];
                }
            }
            
            // Guardar Z en cache
            this.cache.Z.push(Z);
            
            // Si es la capa de salida, no aplicamos activación (salida lineal)
            // A[l] = g(Z[l])
            let A;
            if (l === numLayers - 1) {
                // Salida lineal para la última capa
                A = Z;
            } else {
                // Aplicar función de activación
                A = this.applyActivation(Z, activation);
            }
            
            // Guardar A en cache
            this.cache.A.push(A);
            
            // Para la siguiente iteración
            A_prev = A;
        }
        
        // Devolver la salida (A de la última capa)
        return this.cache.A[this.cache.A.length - 1];
    }
    
    // Aplicar función de activación a cada elemento de la matriz
    applyActivation(Z, activationFunc) {
        const result = [];
        for (let i = 0; i < Z.length; i++) {
            const row = [];
            for (let j = 0; j < Z[i].length; j++) {
                row.push(activationFunc(Z[i][j]));
            }
            result.push(row);
        }
        return result;
    }
    
    // Multiplicación de matrices
    matrixMultiply(A, B) {
        const rowsA = A.length;
        const colsA = A[0].length;
        const colsB = B[0].length;
        
        const result = [];
        
        for (let i = 0; i < rowsA; i++) {
            const row = [];
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += A[i][k] * B[k][j];
                }
                row.push(sum);
            }
            result.push(row);
        }
        
        return result;
    }
    
    // Trasponer matriz
    transpose(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        const result = [];
        for (let j = 0; j < cols; j++) {
            const newRow = [];
            for (let i = 0; i < rows; i++) {
                newRow.push(matrix[i][j]);
            }
            result.push(newRow);
        }
        
        return result;
    }
    
    // Calcular error MSE
    computeLoss(Y_pred, Y) {
        const m = Y[0].length;
        let lossSum = 0;
        
        for (let i = 0; i < Y.length; i++) {
            for (let j = 0; j < Y[i].length; j++) {
                lossSum += Math.pow(Y_pred[i][j] - Y[i][j], 2);
            }
        }
        
        return lossSum / m;
    }
    
    // Backward pass - Retropropagación
    backward(X, Y) {
        const m = X[0].length;
        const numLayers = this.weights.length;
        
        // Obtener la función de activación y su derivada
        const activationDeriv = Activation[this.config.activation].backward;
        
        // Inicializar gradientes
        const dW = [];
        const db = [];
        for (let l = 0; l < numLayers; l++) {
            dW.push(this.createZeroMatrix(this.weights[l].length, this.weights[l][0].length));
            db.push(this.createZeroVector(this.biases[l].length));
        }
        
        // Obtener predicciones y valores de activación
        const Y_pred = this.cache.A[numLayers];
        
        // Cálculo del gradiente de la capa de salida
        // dZ[L] = 2 * (Y_pred - Y) / m  (derivada del MSE)
        const dZ_L = [];
        for (let i = 0; i < Y_pred.length; i++) {
            const row = [];
            for (let j = 0; j < Y_pred[i].length; j++) {
                row.push(2 * (Y_pred[i][j] - Y[i][j]) / m);
            }
            dZ_L.push(row);
        }
        
        let dZ_curr = dZ_L;
        
        // Retropropagar el error desde la capa L hacia atrás
        for (let l = numLayers - 1; l >= 0; l--) {
            const A_prev = this.cache.A[l];
            
            // dW[l] = dZ[l] @ A[l-1].T / m
            const A_prev_T = this.transpose(A_prev);
            dW[l] = this.matrixMultiply(dZ_curr, A_prev_T);
            
            // db[l] = sum(dZ[l], axis=1, keepdims=True) / m
            for (let i = 0; i < dZ_curr.length; i++) {
                let sum = 0;
                for (let j = 0; j < dZ_curr[i].length; j++) {
                    sum += dZ_curr[i][j];
                }
                db[l][i] = sum;
            }
            
            // Si no es la primera capa, calculamos dZ para la capa anterior
            if (l > 0) {
                // dA[l-1] = W[l].T @ dZ[l]
                const W_T = this.transpose(this.weights[l]);
                const dA_prev = this.matrixMultiply(W_T, dZ_curr);
                
                // dZ[l-1] = dA[l-1] * g'(Z[l-1])
                const Z_prev = this.cache.Z[l-1];
                dZ_curr = [];
                
                for (let i = 0; i < dA_prev.length; i++) {
                    const row = [];
                    for (let j = 0; j < dA_prev[i].length; j++) {
                        row.push(dA_prev[i][j] * activationDeriv(Z_prev[i][j]));
                    }
                    dZ_curr.push(row);
                }
            }
        }
        
        // Actualizar pesos y bias usando descenso de gradiente
        for (let l = 0; l < numLayers; l++) {
            for (let i = 0; i < this.weights[l].length; i++) {
                for (let j = 0; j < this.weights[l][i].length; j++) {
                    this.weights[l][i][j] -= this.config.learningRate * dW[l][i][j];
                }
            }
            
            for (let i = 0; i < this.biases[l].length; i++) {
                this.biases[l][i] -= this.config.learningRate * db[l][i];
            }
        }
        
        return this.computeLoss(Y_pred, Y);
    }
    
    // Crear matriz de ceros
    createZeroMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = new Array(cols).fill(0);
            matrix.push(row);
        }
        return matrix;
    }
    
    // Crear vector de ceros
    createZeroVector(size) {
        return new Array(size).fill(0);
    }
    
    // Entrenar por una época
    trainStep(X, Y) {
        // Forward pass
        const Y_pred = this.forward(X);
        
        // Backward pass
        const loss = this.backward(X, Y);
        
        this.epoch++;
        this.lossHistory.push(loss);
        
        return loss;
    }
    
    // Entrenar por múltiples épocas
    train(X, Y, epochs = 1000) {
        this.trainStartTime = performance.now();
        
        for (let i = 0; i < epochs; i++) {
            const loss = this.trainStep(X, Y);
            
            // Opcional: mostrar progreso cada n épocas
            if (i % 100 === 0) {
                console.log(`Época ${i}/${epochs} | Loss: ${loss.toFixed(4)}`);
            }
        }
        
        this.trainEndTime = performance.now();
        const trainingTime = (this.trainEndTime - this.trainStartTime) / 1000; // segundos
        
        console.log(`Entrenamiento completado en ${trainingTime.toFixed(2)}s`);
        console.log(`Loss final: ${this.lossHistory[this.lossHistory.length - 1].toFixed(4)}`);
        
        return {
            lossHistory: this.lossHistory,
            finalLoss: this.lossHistory[this.lossHistory.length - 1],
            trainingTime: trainingTime
        };
    }
    
    // Predecir para nuevos datos
    predict(X) {
        return this.forward(X);
    }
    
    // Generar representación JSON del modelo
    toJSON() {
        return {
            config: this.config,
            weights: this.weights,
            biases: this.biases,
            lossHistory: this.lossHistory,
            epoch: this.epoch,
            trainingTime: (this.trainEndTime - this.trainStartTime) / 1000
        };
    }
    
    // Cargar modelo desde representación JSON
    static fromJSON(json) {
        const model = new VectorNN(json.config);
        model.weights = json.weights;
        model.biases = json.biases;
        model.lossHistory = json.lossHistory;
        model.epoch = json.epoch;
        model.trainStartTime = 0;
        model.trainEndTime = json.trainingTime * 1000;
        return model;
    }
}
