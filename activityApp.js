/**
 * Aplicación para la Actividad de Entrenamiento de Redes Neuronales Vectoriales
 */

class ActivityApp {
    constructor() {
        console.log('ActivityApp constructor iniciado');

        // Inicializar variables
        this.currentModel = null;
        this.trainingData = null;
        this.currentConfig = {
            architecture: '2-3-2',
            learningRate: 0.1,
            epochs: 1000,
            activation: 'relu'
        };
        this.trainingInProgress = false;
        this.epochCounter = 0;
        this.savedModels = [];
        this.charts = {}; // Para almacenar las referencias a los gráficos
        this.elements = {}; // Para almacenar referencias a elementos del DOM
    }
    
    // Inicializar la aplicación
    init() {
        console.log('ActivityApp init iniciado');
        
        // Cargar elementos de la UI
        this.loadUIElements();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Generar datos de entrenamiento
        this.generateTrainingData();
        
        // Inicializar pestañas
        this.initTabs();
        
        // Activar la primera pestaña por defecto
        this.changeTab('training');
        
        console.log('🧠 Aplicación de Actividad de Redes Neuronales inicializada');
    }
    
    // Cargar referencias a elementos de la UI
    loadUIElements() {
        // Pestañas
        this.elements.tabs = document.querySelectorAll('.tab');
        this.elements.tabContents = document.querySelectorAll('.tab-content');
        
        // Configuración del modelo
        this.elements.architecture = document.getElementById('architecture');
        this.elements.learningRate = document.getElementById('learning-rate');
        this.elements.learningRateValue = document.getElementById('learning-rate-value');
        this.elements.epochs = document.getElementById('epochs');
        this.elements.activation = document.getElementById('activation');
        
        // Botones de control
        this.elements.trainModelBtn = document.getElementById('train-model');
        this.elements.saveModelBtn = document.getElementById('save-model');
        this.elements.resetModelBtn = document.getElementById('reset-model');
        
        // Estadísticas
        this.elements.trainingStatus = document.getElementById('training-status');
        this.elements.currentEpoch = document.getElementById('current-epoch');
        this.elements.currentMSE = document.getElementById('current-mse');
        this.elements.trainingTime = document.getElementById('training-time');
        
        // Visualización
        this.elements.lossChart = document.getElementById('loss-chart');
        this.elements.networkStructure = document.getElementById('network-structure');
        this.elements.weightsContainer = document.getElementById('weights-container');
        this.elements.predictionsContainer = document.getElementById('predictions-container');
        this.elements.decisionSurface = document.getElementById('decision-surface');
        
        // Comparación
        this.elements.learningRateChart = document.getElementById('learning-rate-chart');
        this.elements.architectureChart = document.getElementById('architecture-chart');
        this.elements.modelComparisonTable = document.getElementById('model-comparison-table').querySelector('tbody');
        this.elements.lrCompare1 = document.getElementById('lr-compare1');
        this.elements.lrCompare2 = document.getElementById('lr-compare2');
        this.elements.archCompare1 = document.getElementById('arch-compare1');
        this.elements.archCompare2 = document.getElementById('arch-compare2');
        this.elements.compareLRBtn = document.getElementById('compare-lr');
        this.elements.compareArchBtn = document.getElementById('compare-arch');
        
        // Reporte
        this.elements.studentName = document.getElementById('student-name');
        this.elements.modelInfo = document.getElementById('model-info');
        this.elements.criticalAnalysis = document.getElementById('critical-analysis');
        this.elements.modelFile = document.getElementById('model-file');
        this.elements.modelFilename = document.getElementById('model-filename');
        this.elements.generateReportBtn = document.getElementById('generate-report');
        this.elements.downloadReportBtn = document.getElementById('download-report');
        this.elements.reportPreview = document.getElementById('report-preview');
        this.elements.reportContent = document.getElementById('report-content');
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Cambiar pestaña
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.changeTab(tab.dataset.tab);
            });
        });
        
        // Mostrar valor de la tasa de aprendizaje
        this.elements.learningRate.addEventListener('input', () => {
            this.elements.learningRateValue.textContent = this.elements.learningRate.value;
            this.currentConfig.learningRate = parseFloat(this.elements.learningRate.value);
        });
        
        // Actualizar configuración al cambiar los inputs
        this.elements.architecture.addEventListener('change', () => {
            this.currentConfig.architecture = this.elements.architecture.value;
        });
        
        this.elements.epochs.addEventListener('change', () => {
            this.currentConfig.epochs = parseInt(this.elements.epochs.value);
        });
        
        this.elements.activation.addEventListener('change', () => {
            this.currentConfig.activation = this.elements.activation.value;
        });
        
        // Botones de control
        this.elements.trainModelBtn.addEventListener('click', () => this.trainModel());
        this.elements.saveModelBtn.addEventListener('click', () => this.saveModel());
        this.elements.resetModelBtn.addEventListener('click', () => this.resetModel());
        
        // Botones de comparación
        this.elements.compareLRBtn.addEventListener('click', () => this.compareLearningRates());
        this.elements.compareArchBtn.addEventListener('click', () => this.compareArchitectures());
        
        // Reporte
        this.elements.modelFile.addEventListener('change', () => this.handleModelFileUpload());
        this.elements.generateReportBtn.addEventListener('click', () => this.generateReport());
        this.elements.downloadReportBtn.addEventListener('click', () => this.downloadReport());
    }
    
    // Inicializar pestañas
    initTabs() {
        // Mostrar la primera pestaña por defecto
        this.changeTab('training');
    }
    
    // Cambiar de pestaña
    changeTab(tabId) {
        // Ocultar todas las pestañas
        this.elements.tabs.forEach(tab => tab.classList.remove('active'));
        this.elements.tabContents.forEach(content => content.classList.remove('active'));
        
        // Mostrar la pestaña seleccionada
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
        
        // Acciones específicas por pestaña
        if (tabId === 'visualization' && this.currentModel) {
            this.updateVisualization();
        } else if (tabId === 'comparison' && this.trainedModels.length > 0) {
            this.updateComparison();
        }
    }
    
    // Generar datos de entrenamiento
    generateTrainingData() {
        console.log('Generando datos de entrenamiento...');
        this.trainingData = generateLogicDataset(100, 0.05, Date.now());
        console.log('Datos generados:', 
            'X:', this.trainingData.X.map(row => row.length).join('×'),
            'Y:', this.trainingData.Y.map(row => row.length).join('×'));
    }
    
    // Crear modelo según la configuración actual
    createModel() {
        const arch = this.currentConfig.architecture.split('-').map(n => parseInt(n));
        
        // Validar arquitectura
        if (arch.length < 3) {
            console.error('Arquitectura inválida:', this.currentConfig.architecture);
            return null;
        }
        
        const config = {
            inputDim: arch[0],
            hiddenDims: arch.slice(1, -1),  // Todo menos el primero y último
            outputDim: arch[arch.length - 1],
            learningRate: this.currentConfig.learningRate,
            activation: this.currentConfig.activation,
            seed: Date.now()
        };
        
        console.log('Creando modelo con configuración:', config);
        return new VectorNN(config);
    }
    
    // Entrenar el modelo
    async trainModel() {
        // Deshabilitar botones durante entrenamiento
        this.elements.trainModelBtn.disabled = true;
        this.elements.trainModelBtn.textContent = 'Entrenando...';
        this.elements.trainingStatus.textContent = 'En progreso';
        
        try {
            // Crear modelo
            this.currentModel = this.createModel();
            if (!this.currentModel) {
                throw new Error('No se pudo crear el modelo');
            }
            
            // Mostrar estructura de la red
            this.updateNetworkStructure();
            
            // Inicializar gráfico de pérdida
            this.initLossChart();
            
            // Para mostrar progreso en tiempo real
            const totalEpochs = this.currentConfig.epochs;
            const batchSize = Math.min(50, Math.ceil(totalEpochs / 20)); // 20 actualizaciones como máximo
            
            console.log(`Iniciando entrenamiento: ${totalEpochs} épocas en batches de ${batchSize}`);
            
            let currentEpoch = 0;
            const trainStartTime = performance.now();
            
            // Entrenar en batches para mantener la UI actualizada
            while (currentEpoch < totalEpochs) {
                const batchEpochs = Math.min(batchSize, totalEpochs - currentEpoch);
                
                // Entrenar batch
                for (let i = 0; i < batchEpochs; i++) {
                    const loss = this.currentModel.trainStep(this.trainingData.X, this.trainingData.Y);
                    currentEpoch++;
                    
                    // Actualizar UI cada 10 épocas o en la última
                    if (i % 10 === 0 || i === batchEpochs - 1) {
                        this.elements.currentEpoch.textContent = `${currentEpoch}/${totalEpochs}`;
                        this.elements.currentMSE.textContent = loss.toFixed(6);
                    }
                }
                
                // Actualizar gráfico de pérdida
                this.updateLossChart();
                
                // Dar tiempo a la UI para actualizarse
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            const trainEndTime = performance.now();
            const trainingTime = (trainEndTime - trainStartTime) / 1000; // segundos
            
            // Actualizar estadísticas finales
            this.elements.trainingStatus.textContent = 'Completado';
            this.elements.trainingTime.textContent = `${trainingTime.toFixed(2)}s`;
            
            // Guardar modelo en la lista de comparación
            this.addModelToComparison(this.currentModel, trainingTime);
            
            // Activar visualización
            this.updateVisualization();
            
            console.log('Entrenamiento completado:', 
                `${totalEpochs} épocas en ${trainingTime.toFixed(2)}s, ` +
                `Loss final: ${this.currentModel.lossHistory[this.currentModel.lossHistory.length - 1].toFixed(6)}`);
            
        } catch (error) {
            console.error('Error durante el entrenamiento:', error);
            this.elements.trainingStatus.textContent = 'Error';
        } finally {
            // Re-habilitar botones
            this.elements.trainModelBtn.disabled = false;
            this.elements.trainModelBtn.textContent = 'Entrenar modelo';
        }
    }
    
    // Reiniciar modelo
    resetModel() {
        // Limpiar modelo actual
        this.currentModel = null;
        
        // Reiniciar UI
        this.elements.trainingStatus.textContent = 'No iniciado';
        this.elements.currentEpoch.textContent = '0/0';
        this.elements.currentMSE.textContent = '0';
        this.elements.trainingTime.textContent = '0s';
        
        // Regenerar datos
        this.generateTrainingData();
        
        console.log('Modelo reiniciado');
    }
    
    // Guardar modelo actual
    saveModel() {
        if (!this.currentModel) {
            alert('No hay modelo para guardar. Entrena un modelo primero.');
            return;
        }
        
        try {
            // Serializar modelo
            const modelData = this.currentModel.toJSON();
            const modelJson = JSON.stringify(modelData);
            
            // Crear URL para descarga
            const blob = new Blob([modelJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Crear link y disparar descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = `model_${this.currentConfig.architecture}_lr${this.currentConfig.learningRate}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Modelo guardado correctamente');
        } catch (error) {
            console.error('Error guardando modelo:', error);
            alert('Error al guardar el modelo: ' + error.message);
        }
    }
    
    // Añadir modelo a la lista de comparación
    addModelToComparison(model, trainingTime) {
        const modelInfo = {
            id: this.trainedModels.length + 1,
            architecture: this.currentConfig.architecture,
            learningRate: this.currentConfig.learningRate,
            activation: this.currentConfig.activation,
            epochs: this.currentConfig.epochs,
            finalLoss: model.lossHistory[model.lossHistory.length - 1],
            trainingTime: trainingTime,
            lossHistory: [...model.lossHistory],
            model: model
        };
        
        this.trainedModels.push(modelInfo);
        
        // Actualizar tabla de comparación
        this.updateComparisonTable();
        
        // Actualizar selects de comparación
        this.updateComparisonSelects();
        
        console.log('Modelo añadido a la comparación:', modelInfo);
    }
    
    // Inicializar gráfico de pérdida
    initLossChart() {
        // Destruir gráfico anterior si existe
        if (this.charts.lossChart) {
            this.charts.lossChart.destroy();
        }
        
        // Crear nuevo gráfico
        const ctx = this.elements.lossChart.getContext('2d');
        this.charts.lossChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Pérdida (MSE)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Error Cuadrático Medio (MSE)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Épocas'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Curva de Aprendizaje'
                    }
                }
            }
        });
    }
    
    // Actualizar gráfico de pérdida
    updateLossChart() {
        if (!this.currentModel || !this.charts.lossChart) return;
        
        const lossHistory = this.currentModel.lossHistory;
        const labels = Array.from({length: lossHistory.length}, (_, i) => i + 1);
        
        // Limitar puntos en el gráfico para evitar sobrecarga
        const maxPoints = 100;
        let step = 1;
        
        if (lossHistory.length > maxPoints) {
            step = Math.floor(lossHistory.length / maxPoints);
        }
        
        const filteredLabels = [];
        const filteredLoss = [];
        
        for (let i = 0; i < lossHistory.length; i += step) {
            filteredLabels.push(labels[i]);
            filteredLoss.push(lossHistory[i]);
        }
        
        // Asegurarse de incluir el último punto
        if (filteredLabels[filteredLabels.length - 1] !== labels[labels.length - 1]) {
            filteredLabels.push(labels[labels.length - 1]);
            filteredLoss.push(lossHistory[lossHistory.length - 1]);
        }
        
        this.charts.lossChart.data.labels = filteredLabels;
        this.charts.lossChart.data.datasets[0].data = filteredLoss;
        this.charts.lossChart.update();
    }
    
    // Mostrar estructura de la red
    updateNetworkStructure() {
        if (!this.currentModel) return;
        
        const container = this.elements.networkStructure;
        container.innerHTML = '';
        
        // Obtener dimensiones de cada capa
        const inputDim = this.currentModel.config.inputDim;
        const hiddenDims = this.currentModel.config.hiddenDims;
        const outputDim = this.currentModel.config.outputDim;
        
        const allLayers = [inputDim, ...hiddenDims, outputDim];
        const maxNeurons = Math.max(...allLayers);
        
        // Crear contenedor para la red
        const networkDiv = document.createElement('div');
        networkDiv.className = 'network-structure';
        
        // Crear cada capa
        for (let l = 0; l < allLayers.length; l++) {
            const layerDiv = document.createElement('div');
            layerDiv.className = 'layer';
            
            // Etiqueta de la capa
            const layerLabel = document.createElement('div');
            layerLabel.className = 'layer-label';
            layerLabel.textContent = l === 0 ? 'Entrada' : 
                                    l === allLayers.length - 1 ? 'Salida' : 
                                    `Oculta ${l}`;
            layerDiv.appendChild(layerLabel);
            
            // Crear neuronas
            const neurons = allLayers[l];
            for (let n = 0; n < neurons; n++) {
                const neuronDiv = document.createElement('div');
                neuronDiv.className = 'neuron';
                
                // Color según la capa
                if (l === 0) {
                    neuronDiv.classList.add('input-neuron');
                } else if (l === allLayers.length - 1) {
                    neuronDiv.classList.add('output-neuron');
                } else {
                    neuronDiv.classList.add('hidden-neuron');
                }
                
                layerDiv.appendChild(neuronDiv);
            }
            
            networkDiv.appendChild(layerDiv);
            
            // Añadir conexiones entre capas
            if (l < allLayers.length - 1) {
                const connectionsDiv = document.createElement('div');
                connectionsDiv.className = 'connections';
                networkDiv.appendChild(connectionsDiv);
            }
        }
        
        container.appendChild(networkDiv);
        
        // Mostrar info de la arquitectura
        const infoDiv = document.createElement('div');
        infoDiv.className = 'network-info';
        infoDiv.innerHTML = `<strong>Arquitectura:</strong> ${this.currentConfig.architecture}<br>
                          <strong>Activación:</strong> ${this.currentConfig.activation}<br>
                          <strong>Tasa de aprendizaje:</strong> ${this.currentConfig.learningRate}`;
        container.appendChild(infoDiv);
    }
    
    // Actualizar tabla de comparación de modelos
    updateComparisonTable() {
        if (this.trainedModels.length === 0) return;
        
        const table = this.elements.modelComparisonTable;
        table.innerHTML = '';
        
        // Ordenar modelos por pérdida final (menor a mayor)
        const sortedModels = [...this.trainedModels].sort((a, b) => a.finalLoss - b.finalLoss);
        
        // Añadir filas a la tabla
        for (const model of sortedModels) {
            const row = document.createElement('tr');
            
            // Añadir celdas con la información del modelo
            row.innerHTML = `
                <td>${model.id}</td>
                <td>${model.architecture}</td>
                <td>${model.activation}</td>
                <td>${model.learningRate}</td>
                <td>${model.epochs}</td>
                <td>${model.finalLoss.toFixed(6)}</td>
                <td>${model.trainingTime.toFixed(2)}s</td>
                <td><button class="btn-action select-model" data-id="${model.id}">Seleccionar</button></td>
            `;
            
            table.appendChild(row);
        }
        
        // Añadir event listeners a los botones de seleccionar
        const selectButtons = table.querySelectorAll('.select-model');
        selectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modelId = parseInt(button.dataset.id);
                this.selectModelFromComparison(modelId);
            });
        });
    }
    
    // Seleccionar un modelo de la tabla de comparación
    selectModelFromComparison(modelId) {
        const model = this.trainedModels.find(m => m.id === modelId);
        if (!model) return;
        
        this.currentModel = model.model;
        this.currentConfig = {
            architecture: model.architecture,
            learningRate: model.learningRate,
            epochs: model.epochs,
            activation: model.activation
        };
        
        // Actualizar UI
        this.elements.architecture.value = model.architecture;
        this.elements.learningRate.value = model.learningRate;
        this.elements.learningRateValue.textContent = model.learningRate;
        this.elements.epochs.value = model.epochs;
        this.elements.activation.value = model.activation;
        
        // Actualizar estadísticas
        this.elements.trainingStatus.textContent = 'Completado';
        this.elements.currentEpoch.textContent = `${model.epochs}/${model.epochs}`;
        this.elements.currentMSE.textContent = model.finalLoss.toFixed(6);
        this.elements.trainingTime.textContent = `${model.trainingTime.toFixed(2)}s`;
        
        // Actualizar visualizaciones
        this.updateNetworkStructure();
        this.initLossChart();
        this.updateLossChart();
        
        // Cambiar a la pestaña de entrenamiento
        this.changeTab('training');
        
        console.log(`Modelo #${modelId} seleccionado de la comparación`);
    }
    
    // Actualizar selects de comparación
    updateComparisonSelects() {
        // Obtener referencias a los selects
        const selects = [
            this.elements.lrCompare1,
            this.elements.lrCompare2,
            this.elements.archCompare1,
            this.elements.archCompare2
        ];
        
        // Limpiar opciones
        selects.forEach(select => {
            select.innerHTML = '<option value="">Seleccionar modelo</option>';
        });
        
        // Añadir opciones para cada modelo
        for (const model of this.trainedModels) {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `#${model.id}: ${model.architecture}, LR=${model.learningRate}`;
            
            selects.forEach(select => {
                select.appendChild(option.cloneNode(true));
            });
        }
    }
    
    // Comparar modelos por tasa de aprendizaje
    compareLearningRates() {
        const id1 = parseInt(this.elements.lrCompare1.value);
        const id2 = parseInt(this.elements.lrCompare2.value);
        
        if (isNaN(id1) || isNaN(id2) || id1 === id2) {
            alert('Selecciona dos modelos diferentes para comparar');
            return;
        }
        
        const model1 = this.trainedModels.find(m => m.id === id1);
        const model2 = this.trainedModels.find(m => m.id === id2);
        
        if (!model1 || !model2) return;
        
        // Crear gráfico de comparación
        if (this.charts.lrComparisonChart) {
            this.charts.lrComparisonChart.destroy();
        }
        
        const ctx = this.elements.learningRateChart.getContext('2d');
        this.charts.lrComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: Math.max(model1.lossHistory.length, model2.lossHistory.length)}, (_, i) => i + 1),
                datasets: [
                    {
                        label: `LR=${model1.learningRate}`,
                        data: model1.lossHistory,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                    },
                    {
                        label: `LR=${model2.learningRate}`,
                        data: model2.lossHistory,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'MSE'
                        },
                        type: 'logarithmic'
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Épocas'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación de Tasas de Aprendizaje'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(6)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Comparar modelos por arquitectura
    compareArchitectures() {
        const id1 = parseInt(this.elements.archCompare1.value);
        const id2 = parseInt(this.elements.archCompare2.value);
        
        if (isNaN(id1) || isNaN(id2) || id1 === id2) {
            alert('Selecciona dos modelos diferentes para comparar');
            return;
        }
        
        const model1 = this.trainedModels.find(m => m.id === id1);
        const model2 = this.trainedModels.find(m => m.id === id2);
        
        if (!model1 || !model2) return;
        
        // Crear gráfico de comparación
        if (this.charts.archComparisonChart) {
            this.charts.archComparisonChart.destroy();
        }
        
        const ctx = this.elements.architectureChart.getContext('2d');
        this.charts.archComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: Math.max(model1.lossHistory.length, model2.lossHistory.length)}, (_, i) => i + 1),
                datasets: [
                    {
                        label: `${model1.architecture}`,
                        data: model1.lossHistory,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderWidth: 2,
                    },
                    {
                        label: `${model2.architecture}`,
                        data: model2.lossHistory,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderWidth: 2,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'MSE'
                        },
                        type: 'logarithmic'
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Épocas'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación de Arquitecturas'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(6)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Actualizar todas las visualizaciones
    updateVisualization() {
        if (!this.currentModel) return;
        
        // Mostrar estructura de la red
        this.updateNetworkStructure();
        
        // Mostrar pesos y bias
        this.updateWeightsTable();
        
        // Mostrar predicciones para datos ejemplo
        this.updatePredictionsTable();
        
        // Visualizar superficie de decisión
        this.drawDecisionSurface();
    }
    
    // Actualizar tabla de pesos y bias
    updateWeightsTable() {
        if (!this.currentModel) return;
        
        const container = this.elements.weightsContainer;
        container.innerHTML = '';
        
        // Crear tablas para cada capa
        for (let l = 0; l < this.currentModel.weights.length; l++) {
            const layerDiv = document.createElement('div');
            layerDiv.className = 'weight-layer';
            
            const layerTitle = document.createElement('h4');
            layerTitle.textContent = l === this.currentModel.weights.length - 1 ? 
                'Capa de salida' : `Capa oculta ${l+1}`;
            layerDiv.appendChild(layerTitle);
            
            // Tabla de pesos
            const weightTable = document.createElement('table');
            weightTable.className = 'weights-table';
            
            // Crear encabezado de tabla
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // Añadir encabezado vacío para la esquina
            headerRow.appendChild(document.createElement('th'));
            
            // Añadir encabezados de columnas (neuronas de entrada)
            const prevLayerSize = this.currentModel.weights[l][0].length;
            for (let i = 0; i < prevLayerSize; i++) {
                const th = document.createElement('th');
                th.textContent = `Entrada ${i+1}`;
                headerRow.appendChild(th);
            }
            
            // Añadir columna para bias
            const biasHeader = document.createElement('th');
            biasHeader.textContent = 'Bias';
            headerRow.appendChild(biasHeader);
            
            thead.appendChild(headerRow);
            weightTable.appendChild(thead);
            
            // Crear cuerpo de la tabla
            const tbody = document.createElement('tbody');
            
            // Añadir filas (una por neurona en la capa actual)
            for (let i = 0; i < this.currentModel.weights[l].length; i++) {
                const row = document.createElement('tr');
                
                // Nombre de la neurona
                const neuronName = document.createElement('th');
                neuronName.textContent = `Neurona ${i+1}`;
                row.appendChild(neuronName);
                
                // Pesos de esta neurona
                for (let j = 0; j < this.currentModel.weights[l][i].length; j++) {
                    const cell = document.createElement('td');
                    cell.textContent = this.currentModel.weights[l][i][j].toFixed(4);
                    row.appendChild(cell);
                }
                
                // Bias de esta neurona
                const biasCell = document.createElement('td');
                biasCell.textContent = this.currentModel.biases[l][i].toFixed(4);
                row.appendChild(biasCell);
                
                tbody.appendChild(row);
            }
            
            weightTable.appendChild(tbody);
            layerDiv.appendChild(weightTable);
            container.appendChild(layerDiv);
        }
    }
    
    // Actualizar tabla de predicciones para ejemplos
    updatePredictionsTable() {
        if (!this.currentModel) return;
        
        const container = this.elements.predictionsContainer;
        container.innerHTML = '';
        
        // Crear tabla
        const table = document.createElement('table');
        table.className = 'predictions-table';
        
        // Encabezado
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        headerRow.innerHTML = `
            <th>X1</th>
            <th>X2</th>
            <th>Y1 (AND)</th>
            <th>Y2 (OR)</th>
            <th>Predicción Y1</th>
            <th>Predicción Y2</th>
        `;
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Cuerpo
        const tbody = document.createElement('tbody');
        
        // Ejemplos base sin ruido
        const baseExamples = [
            {x1: 0, x2: 0, y1: 0, y2: 0},
            {x1: 0, x2: 1, y1: 0, y2: 1},
            {x1: 1, x2: 0, y1: 0, y2: 1},
            {x1: 1, x2: 1, y1: 1, y2: 1}
        ];
        
        // Mostrar predicciones para cada ejemplo
        for (const example of baseExamples) {
            // Preparar inputs
            const X = [[example.x1], [example.x2]];
            
            // Obtener predicción
            const Y_pred = this.currentModel.predict(X);
            
            // Crear fila
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${example.x1}</td>
                <td>${example.x2}</td>
                <td>${example.y1}</td>
                <td>${example.y2}</td>
                <td>${Y_pred[0][0].toFixed(4)}</td>
                <td>${Y_pred[1][0].toFixed(4)}</td>
            `;
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        container.appendChild(table);
    }
    
    // Dibujar superficie de decisión
    drawDecisionSurface() {
        if (!this.currentModel) return;
        
        const canvas = this.elements.decisionSurface;
        const ctx = canvas.getContext('2d');
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dimensiones del canvas
        const width = canvas.width;
        const height = canvas.height;
        
        // Rango para X1 y X2 (ampliado para visualizar mejor)
        const xMin = -0.5;
        const xMax = 1.5;
        const yMin = -0.5;
        const yMax = 1.5;
        
        // Número de puntos en la cuadrícula
        const resolution = 100;
        
        // Tamaño de cada celda
        const cellWidth = width / resolution;
        const cellHeight = height / resolution;
        
        // Crear imagen de la superficie de decisión
        const imageData = ctx.createImageData(width, height);
        
        // Para cada punto en la cuadrícula
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                // Convertir coordenadas de píxel a valores X1, X2
                const x1 = xMin + (xMax - xMin) * i / resolution;
                const x2 = yMax - (yMax - yMin) * j / resolution; // Invertido para Y
                
                // Predecir
                const X = [[x1], [x2]];
                const Y_pred = this.currentModel.predict(X);
                
                // Obtener valores predichos para AND y OR
                const andPred = Y_pred[0][0];
                const orPred = Y_pred[1][0];
                
                // Calcular color basado en predicciones
                // Rojo: AND, Verde: OR, Azul: Ambos
                const pixelIndex = (j * width + i) * 4;
                
                imageData.data[pixelIndex] = Math.min(255, Math.max(0, Math.round(andPred * 255))); // R
                imageData.data[pixelIndex + 1] = Math.min(255, Math.max(0, Math.round(orPred * 255))); // G
                imageData.data[pixelIndex + 2] = 0; // B
                imageData.data[pixelIndex + 3] = 255; // Alpha
            }
        }
        
        // Dibujar la imagen
        ctx.putImageData(imageData, 0, 0);
        
        // Dibujar ejes
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // Eje X
        const yAxisPos = height * (yMax / (yMax - yMin));
        ctx.beginPath();
        ctx.moveTo(0, yAxisPos);
        ctx.lineTo(width, yAxisPos);
        ctx.stroke();
        
        // Eje Y
        const xAxisPos = width * (0 - xMin) / (xMax - xMin);
        ctx.beginPath();
        ctx.moveTo(xAxisPos, 0);
        ctx.lineTo(xAxisPos, height);
        ctx.stroke();
        
        // Marcar puntos de ejemplo
        const examples = [
            {x1: 0, x2: 0, color: 'white'},
            {x1: 0, x2: 1, color: 'lime'},
            {x1: 1, x2: 0, color: 'lime'},
            {x1: 1, x2: 1, color: 'yellow'}
        ];
        
        for (const example of examples) {
            const x = width * (example.x1 - xMin) / (xMax - xMin);
            const y = height * (yMax - example.x2) / (yMax - yMin);
            
            ctx.fillStyle = example.color;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    // Manejar carga de archivo de modelo
    handleModelFileUpload() {
        const file = this.elements.modelFile.files[0];
        if (!file) return;
        
        // Mostrar nombre del archivo
        this.elements.modelFilename.textContent = file.name;
        
        // Leer archivo
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const modelData = JSON.parse(e.target.result);
                
                // Crear modelo a partir de los datos
                this.currentModel = VectorNN.fromJSON(modelData);
                
                // Actualizar configuración actual
                this.currentConfig = {
                    architecture: modelData.config.inputDim + '-' + 
                                 modelData.config.hiddenDims.join('-') + '-' + 
                                 modelData.config.outputDim,
                    learningRate: modelData.config.learningRate,
                    epochs: modelData.epoch,
                    activation: modelData.config.activation
                };
                
                // Actualizar UI del reporte
                this.updateModelInfo();
                
            } catch (error) {
                console.error('Error cargando modelo:', error);
                alert('Error al cargar el modelo: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
    
    // Actualizar información del modelo en la pestaña de reporte
    updateModelInfo() {
        if (!this.currentModel) return;
        
        this.elements.modelInfo.value = 
            `Arquitectura: ${this.currentConfig.architecture}\n` +
            `Activación: ${this.currentConfig.activation}\n` +
            `Tasa de aprendizaje: ${this.currentConfig.learningRate}\n` +
            `Épocas: ${this.currentConfig.epochs}\n` +
            `MSE final: ${this.currentModel.lossHistory[this.currentModel.lossHistory.length - 1].toFixed(6)}`;
    }
    
    // Generar reporte
    generateReport() {
        // Verificar campos requeridos
        if (!this.elements.studentName.value) {
            alert('Por favor, ingresa tu nombre.');
            return;
        }
        
        if (!this.currentModel && !this.elements.modelFile.files[0]) {
            alert('Por favor, carga un modelo entrenado o entrena uno nuevo.');
            return;
        }
        
        if (!this.elements.criticalAnalysis.value) {
            alert('Por favor, completa el análisis crítico.');
            return;
        }
        
        // Generar contenido del reporte
        const studentName = this.elements.studentName.value;
        const modelInfo = this.elements.modelInfo.value;
        const criticalAnalysis = this.elements.criticalAnalysis.value;
        
        // Construir HTML del reporte
        const reportHTML = `
            <div class="report">
                <h1>Reporte: Actividad de Entrenamiento de Redes Neuronales</h1>
                <h2>Estudiante: ${studentName}</h2>
                <hr>
                
                <h3>Información del Modelo</h3>
                <pre>${modelInfo}</pre>
                
                <h3>Análisis Crítico</h3>
                <div class="analysis">${criticalAnalysis.replace(/\n/g, '<br>')}</div>
                
                <h3>Fecha y Hora</h3>
                <p>${new Date().toLocaleString()}</p>
            </div>
        `;
        
        // Mostrar vista previa
        this.elements.reportContent.innerHTML = reportHTML;
        this.elements.reportPreview.style.display = 'block';
        this.elements.downloadReportBtn.disabled = false;
    }
    
    // Descargar reporte como PDF o HTML
    downloadReport() {
        const reportHTML = this.elements.reportContent.innerHTML;
        const studentName = this.elements.studentName.value.replace(/\s+/g, '_');
        
        // Crear HTML completo
        const fullHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Actividad - ${studentName}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1, h2, h3 { color: #333; }
                    hr { border: 1px solid #ddd; margin: 20px 0; }
                    pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
                    .analysis { text-align: justify; }
                </style>
            </head>
            <body>
                ${reportHTML}
            </body>
            </html>
        `;
        
        // Crear blob y link para descarga
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${studentName}_${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Método para inicializar la aplicación
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM cargado, inicializando aplicación');
            window.app = new ActivityApp();
            window.app.init();
        });
    }
}
