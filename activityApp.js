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
        
        try {
            // Cargar elementos de la UI
            this.loadUIElements();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Generar datos de entrenamiento
            this.generateTrainingData();
            
            // Inicializar pestañas
            this.initTabs();
            
            console.log('🧠 Aplicación de Actividad de Redes Neuronales inicializada');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
        }
    }
    
    // Cargar referencias a elementos de la UI
    loadUIElements() {
        console.log('Cargando elementos UI');
        try {
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
            const modelComparisonTable = document.getElementById('model-comparison-table');
            if (modelComparisonTable) {
                this.elements.modelComparisonTable = modelComparisonTable.querySelector('tbody');
            } else {
                console.warn('No se encontró el elemento model-comparison-table');
            }
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
            
            console.log('Elementos UI cargados correctamente');
        } catch (error) {
            console.error('Error al cargar elementos UI:', error);
        }
    }
    
    // Configurar event listeners
    setupEventListeners() {
        console.log('Configurando event listeners');
        try {
            // Tabs
            if (this.elements.tabs) {
                this.elements.tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabId = tab.getAttribute('data-tab');
                        this.changeTab(tabId);
                    });
                });
            }
            
            // Configuración del modelo
            if (this.elements.architecture) {
                this.elements.architecture.addEventListener('change', () => {
                    this.currentConfig.architecture = this.elements.architecture.value;
                    this.createModel();
                });
            }
            
            if (this.elements.learningRate && this.elements.learningRateValue) {
                this.elements.learningRate.addEventListener('input', () => {
                    const value = parseFloat(this.elements.learningRate.value).toFixed(3);
                    this.elements.learningRateValue.textContent = value;
                    this.currentConfig.learningRate = parseFloat(value);
                    if (this.currentModel) {
                        this.currentModel.config.learningRate = parseFloat(value);
                    }
                });
            }
            
            if (this.elements.epochs) {
                this.elements.epochs.addEventListener('change', () => {
                    this.currentConfig.epochs = parseInt(this.elements.epochs.value);
                });
            }
            
            if (this.elements.activation) {
                this.elements.activation.addEventListener('change', () => {
                    this.currentConfig.activation = this.elements.activation.value;
                    this.createModel();
                });
            }
            
            // Botones de control
            if (this.elements.trainModelBtn) {
                this.elements.trainModelBtn.addEventListener('click', () => this.trainModel());
            }
            
            if (this.elements.saveModelBtn) {
                this.elements.saveModelBtn.addEventListener('click', () => this.saveModel());
            }
            
            if (this.elements.resetModelBtn) {
                this.elements.resetModelBtn.addEventListener('click', () => this.resetModel());
            }
            
            // Botones de comparación
            if (this.elements.compareLRBtn) {
                this.elements.compareLRBtn.addEventListener('click', () => this.compareLearningRates());
            }
            
            if (this.elements.compareArchBtn) {
                this.elements.compareArchBtn.addEventListener('click', () => this.compareArchitectures());
            }
            
            // Reporte
            if (this.elements.modelFile) {
                this.elements.modelFile.addEventListener('change', () => this.handleModelFileUpload());
            }
            
            if (this.elements.generateReportBtn) {
                this.elements.generateReportBtn.addEventListener('click', () => this.generateReport());
            }
            
            if (this.elements.downloadReportBtn) {
                this.elements.downloadReportBtn.addEventListener('click', () => this.downloadReport());
            }
            
            console.log('Event listeners configurados correctamente');
        } catch (error) {
            console.error('Error al configurar event listeners:', error);
        }
    }
    
    // Inicializar pestañas
    initTabs() {
        try {
            console.log('Inicializando pestañas');
            
            // Verificar si hay pestañas antes de inicializar
            if (this.elements.tabs && this.elements.tabs.length > 0) {
                // Crear modelo inicial
                this.createModel();
                
                // Inicializar gráfico de pérdida
                this.initLossChart();
                
                // Cambiar a la primera pestaña por defecto
                this.changeTab('training');
                
                console.log('Pestañas inicializadas correctamente');
            } else {
                console.warn('No se encontraron pestañas para inicializar');
            }
        } catch (error) {
            console.error('Error al inicializar pestañas:', error);
        }
    }
    
    // Cambiar de pestaña
    changeTab(tabId) {
        try {
            console.log(`Cambiando a pestaña: ${tabId}`);
            
            // Ocultar todas las pestañas
            if (this.elements.tabs && this.elements.tabContents) {
                this.elements.tabs.forEach(tab => tab.classList.remove('active'));
                this.elements.tabContents.forEach(content => content.classList.remove('active'));
                
                // Mostrar la pestaña seleccionada
                const selectedTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
                const selectedContent = document.querySelector(`.tab-content[data-tab="${tabId}"]`);
                
                if (selectedTab && selectedContent) {
                    selectedTab.classList.add('active');
                    selectedContent.classList.add('active');
                    
                    // Acciones específicas por pestaña
                    if (tabId === 'visualization' && this.currentModel) {
                        this.updateVisualization();
                    } else if (tabId === 'comparison' && this.savedModels && this.savedModels.length > 0) {
                        this.updateComparisonTable();
                    }
                    
                    console.log(`Pestaña ${tabId} activada`);
                } else {
                    console.error(`No se encontró la pestaña ${tabId}`);
                }
            } else {
                console.error('No se encontraron elementos de pestañas');
            }
        } catch (error) {
            console.error(`Error al cambiar a la pestaña ${tabId}:`, error);
        }
    }
    
    // Generar datos de entrenamiento
    generateTrainingData() {
        try {
            console.log('Generando datos de entrenamiento...');
            this.trainingData = generateLogicDataset(100, 0.05, Date.now());
            console.log('Datos generados:', 
                'X:', this.trainingData.X.map(row => row.length).join('×'),
                'Y:', this.trainingData.Y.map(row => row.length).join('×'));
        } catch (error) {
            console.error('Error al generar datos de entrenamiento:', error);
        }
    }
    
    // Crear modelo según la configuración actual
    createModel() {
        try {
            console.log('Creando modelo con configuración:', this.currentConfig);
            
            const arch = this.currentConfig.architecture.split('-').map(n => parseInt(n));
            
            // Validar arquitectura
            if (arch.length < 3) {
                console.error('Arquitectura inválida:', this.currentConfig.architecture);
                return null;
            }
            
            // Crear y configurar el modelo
            this.currentModel = new VectorNN({
                inputDim: arch[0],
                hiddenDims: arch.slice(1, -1),
                outputDim: arch[arch.length - 1],
                activation: this.currentConfig.activation,
                learningRate: this.currentConfig.learningRate,
                seed: Date.now()
            });
            
            console.log('Modelo creado:', this.currentModel);
            
            // Actualizar visualizaciones
            this.updateNetworkStructure();
            
            return this.currentModel;
        } catch (error) {
            console.error('Error al crear el modelo:', error);
            return null;
        }
    }
    
    // Entrenar el modelo
    async trainModel() {
        try {
            if (!this.currentModel || !this.trainingData) {
                console.error('No hay modelo o datos de entrenamiento disponibles');
                return;
            }
            
            if (this.trainingInProgress) {
                console.log('Ya hay un entrenamiento en curso');
                return;
            }
            
            // Deshabilitar botones durante entrenamiento
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.disabled = true;
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.textContent = 'Entrenando...';
            if (this.elements.resetModelBtn) this.elements.resetModelBtn.disabled = true;
            
            this.trainingInProgress = true;
            this.epochCounter = 0;
            
            // Iniciar temporizador
            const startTime = performance.now();
            if (this.elements.trainingStatus) this.elements.trainingStatus.textContent = 'Entrenando...';
            
            // Entrenamiento por lotes para permitir actualización de UI
            const batchSize = Math.min(50, this.currentConfig.epochs);
            const totalEpochs = this.currentConfig.epochs;
            
            for (let i = 0; i < totalEpochs; i += batchSize) {
                if (!this.trainingInProgress) break;
                
                const currentBatch = Math.min(batchSize, totalEpochs - i);
                
                // Entrenar batch
                await new Promise(resolve => {
                    setTimeout(() => {
                        for (let j = 0; j < currentBatch; j++) {
                            this.currentModel.trainStep(this.trainingData.X, this.trainingData.Y);
                            this.epochCounter++;
                        }
                        resolve();
                    }, 0);
                });
                
                // Actualizar UI
                const currentLoss = this.currentModel.lossHistory[this.currentModel.lossHistory.length - 1];
                if (this.elements.currentEpoch) this.elements.currentEpoch.textContent = this.epochCounter;
                if (this.elements.currentMSE) this.elements.currentMSE.textContent = currentLoss.toFixed(6);
                
                // Actualizar gráfico de pérdida
                this.updateLossChart();
                
                // Permitir que el navegador actualice la UI
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Finalizar entrenamiento
            const endTime = performance.now();
            const trainingTime = ((endTime - startTime) / 1000).toFixed(2);
            
            if (this.elements.trainingStatus) this.elements.trainingStatus.textContent = 'Entrenamiento completado';
            if (this.elements.trainingTime) this.elements.trainingTime.textContent = `${trainingTime} s`;
            
            // Rehabilitar botones
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.disabled = false;
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.textContent = 'Entrenar Modelo';
            if (this.elements.resetModelBtn) this.elements.resetModelBtn.disabled = false;
            if (this.elements.saveModelBtn) this.elements.saveModelBtn.disabled = false;
            
            // Actualizar visualizaciones
            this.updateVisualization();
            
            // Añadir a comparación
            this.addModelToComparison(this.currentModel, trainingTime);
            
            this.trainingInProgress = false;
            console.log('Entrenamiento completado en', trainingTime, 's');
        } catch (error) {
            console.error('Error durante el entrenamiento:', error);
            this.trainingInProgress = false;
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.disabled = false;
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.textContent = 'Entrenar Modelo';
            if (this.elements.resetModelBtn) this.elements.resetModelBtn.disabled = false;
            if (this.elements.trainingStatus) this.elements.trainingStatus.textContent = 'Error en el entrenamiento';
        }
    }
    
    // Reiniciar modelo
    resetModel() {
        try {
            if (this.trainingInProgress) {
                // Detener entrenamiento en curso
                this.trainingInProgress = false;
            }
            
            // Crear nuevo modelo con la configuración actual
            this.createModel();
            
            // Reiniciar UI
            if (this.elements.currentEpoch) this.elements.currentEpoch.textContent = '0';
            if (this.elements.currentMSE) this.elements.currentMSE.textContent = '-';
            if (this.elements.trainingStatus) this.elements.trainingStatus.textContent = 'No entrenado';
            if (this.elements.trainingTime) this.elements.trainingTime.textContent = '-';
            
            // Habilitar/deshabilitar botones según corresponda
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.disabled = false;
            if (this.elements.trainModelBtn) this.elements.trainModelBtn.textContent = 'Entrenar Modelo';
            if (this.elements.resetModelBtn) this.elements.resetModelBtn.disabled = false;
            if (this.elements.saveModelBtn) this.elements.saveModelBtn.disabled = true;
            
            // Reiniciar gráfico
            this.initLossChart();
            
            console.log('Modelo reiniciado');
        } catch (error) {
            console.error('Error al reiniciar el modelo:', error);
        }
    }
    
    // Inicializar gráfico de pérdida
    initLossChart() {
        try {
            if (this.charts.lossChart) {
                this.charts.lossChart.destroy();
            }
            
            if (!this.elements.lossChart) {
                console.warn('No se encontró el elemento lossChart');
                return;
            }
            
            const ctx = this.elements.lossChart.getContext('2d');
            if (!ctx) {
                console.warn('No se pudo obtener el contexto 2D del canvas');
                return;
            }
            
            this.charts.lossChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Error (MSE)',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    animation: false,
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
                                text: 'Época'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Evolución del Error Durante el Entrenamiento'
                        }
                    }
                }
            });
            
            console.log('Gráfico de pérdida inicializado');
        } catch (error) {
            console.error('Error al inicializar el gráfico de pérdida:', error);
        }
    }
    
    // Actualizar gráfico de pérdida
    updateLossChart() {
        try {
            if (!this.currentModel || !this.charts.lossChart) return;
            
            const chart = this.charts.lossChart;
            const lossHistory = this.currentModel.lossHistory;
            
            // Crear etiquetas para cada época
            const labels = Array.from({ length: lossHistory.length }, (_, i) => i + 1);
            
            // Actualizar datos del gráfico
            chart.data.labels = labels;
            chart.data.datasets[0].data = lossHistory;
            
            // Si hay demasiados puntos, mostrar solo una muestra
            if (lossHistory.length > 100) {
                const step = Math.floor(lossHistory.length / 100);
                chart.data.labels = labels.filter((_, i) => i % step === 0);
                chart.data.datasets[0].data = lossHistory.filter((_, i) => i % step === 0);
            }
            
            chart.update();
        } catch (error) {
            console.error('Error al actualizar el gráfico de pérdida:', error);
        }
    }
    
    // Guardar modelo actual
    saveModel() {
        try {
            if (!this.currentModel) {
                alert('No hay modelo para guardar');
                return;
            }
            
            const modelConfig = {
                architecture: this.currentConfig.architecture,
                activation: this.currentConfig.activation,
                learningRate: this.currentConfig.learningRate,
                epochs: this.epochCounter,
                timestamp: new Date().toISOString(),
                loss: this.currentModel.lossHistory[this.currentModel.lossHistory.length - 1]
            };
            
            // Serializar modelo
            const modelJSON = this.currentModel.toJSON();
            const modelData = JSON.stringify({
                config: modelConfig,
                model: modelJSON
            });
            
            // Crear blob y link para descarga
            const blob = new Blob([modelData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const filename = `modelo_${modelConfig.architecture}_${modelConfig.activation}_${new Date().toISOString().slice(0, 10)}.json`;
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Modelo guardado:', filename);
        } catch (error) {
            console.error('Error al guardar el modelo:', error);
            alert('Error al guardar el modelo');
        }
    }
    
    // Añadir modelo a la lista de comparación
    addModelToComparison(model, trainingTime) {
        try {
            if (!model) return;
            
            const modelConfig = {
                id: Date.now().toString(),
                architecture: this.currentConfig.architecture,
                activation: this.currentConfig.activation,
                learningRate: this.currentConfig.learningRate,
                epochs: this.epochCounter,
                loss: model.lossHistory[model.lossHistory.length - 1],
                trainingTime: trainingTime,
                model: model
            };
            
            // Guardar modelo
            if (!this.savedModels) this.savedModels = [];
            this.savedModels.push(modelConfig);
            
            // Actualizar tabla de comparación si estamos en esa pestaña
            this.updateComparisonTable();
            
            console.log('Modelo añadido a la comparación:', modelConfig);
        } catch (error) {
            console.error('Error al añadir modelo a la comparación:', error);
        }
    }
    
    // Actualizar tabla de comparación de modelos
    updateComparisonTable() {
        try {
            if (!this.elements.modelComparisonTable || !this.savedModels || this.savedModels.length === 0) return;
            
            const tbody = this.elements.modelComparisonTable;
            tbody.innerHTML = ''; // Limpiar tabla
            
            // Añadir filas para cada modelo
            this.savedModels.forEach((model, index) => {
                const row = document.createElement('tr');
                
                // Añadir celdas
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${model.architecture}</td>
                    <td>${model.activation}</td>
                    <td>${model.learningRate}</td>
                    <td>${model.epochs}</td>
                    <td>${model.loss.toFixed(6)}</td>
                    <td>${model.trainingTime}s</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-model" data-model-id="${model.id}">Ver</button>
                        <button class="btn btn-sm btn-danger delete-model" data-model-id="${model.id}">Eliminar</button>
                    </td>
                `;
                
                tbody.appendChild(row);
                
                // Añadir event listeners a botones
                const viewBtn = row.querySelector('.view-model');
                const deleteBtn = row.querySelector('.delete-model');
                
                if (viewBtn) {
                    viewBtn.addEventListener('click', () => {
                        // Cargar modelo para visualización
                        const selectedModel = this.savedModels.find(m => m.id === model.id);
                        if (selectedModel && selectedModel.model) {
                            this.currentModel = selectedModel.model;
                            this.changeTab('visualization');
                        }
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        // Eliminar modelo
                        this.savedModels = this.savedModels.filter(m => m.id !== model.id);
                        this.updateComparisonTable();
                    });
                }
            });
            
            console.log('Tabla de comparación actualizada');
        } catch (error) {
            console.error('Error al actualizar tabla de comparación:', error);
        }
    }
    
    // Actualizar visualización de la red
    updateVisualization() {
        try {
            if (!this.currentModel) return;
            
            // Actualizar estructura de la red
            this.updateNetworkStructure();
            
            // Actualizar superficie de decisión
            this.updateDecisionSurface();
            
            console.log('Visualización actualizada');
        } catch (error) {
            console.error('Error al actualizar visualización:', error);
        }
    }
    
    // Actualizar estructura de la red
    updateNetworkStructure() {
        try {
            if (!this.currentModel || !this.elements.networkStructure) return;
            
            const canvas = this.elements.networkStructure;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Limpiar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Configuración
            const padding = 40;
            const width = canvas.width - 2 * padding;
            const height = canvas.height - 2 * padding;
            
            // Determinar la arquitectura de la red
            const layers = [
                this.currentModel.config.inputDim, 
                ...this.currentModel.config.hiddenDims, 
                this.currentModel.config.outputDim
            ];
            const maxNeurons = Math.max(...layers);
            
            // Calcular tamaño de neuronas y espaciado
            const neuronRadius = Math.min(15, height / (2 * maxNeurons));
            const layerSpacing = width / (layers.length - 1);
            
            // Dibujar capas
            for (let l = 0; l < layers.length; l++) {
                const neurons = layers[l];
                const layerHeight = neurons * 2 * neuronRadius;
                const startY = (height - layerHeight) / 2 + padding + neuronRadius;
                const x = l * layerSpacing + padding;
                
                // Dibujar conexiones
                if (l > 0) {
                    const prevNeurons = layers[l-1];
                    const prevLayerHeight = prevNeurons * 2 * neuronRadius;
                    const prevStartY = (height - prevLayerHeight) / 2 + padding + neuronRadius;
                    const prevX = (l-1) * layerSpacing + padding;
                    
                    // Para cada neurona en esta capa
                    for (let j = 0; j < neurons; j++) {
                        const y = startY + j * 2 * neuronRadius;
                        
                        // Conectar con todas las neuronas de la capa anterior
                        for (let i = 0; i < prevNeurons; i++) {
                            const prevY = prevStartY + i * 2 * neuronRadius;
                            
                            // Obtener peso si está disponible
                            let weight = 0;
                            if (l === 1 && this.currentModel.weights[0]) { // Primera capa oculta
                                weight = this.currentModel.weights[0][j][i] || 0;
                            } else if (l > 1 && this.currentModel.weights[l-1]) { // Capas ocultas posteriores
                                weight = this.currentModel.weights[l-1][j][i] || 0;
                            }
                            
                            // Determinar color y grosor basado en el peso
                            const absWeight = Math.abs(weight);
                            const maxWeight = 1.0; // Valor arbitrario para normalización
                            const normalizedWeight = Math.min(absWeight / maxWeight, 1);
                            
                            // Positivo: azul, Negativo: rojo
                            const color = weight >= 0 ? 
                                `rgba(0, 0, 255, ${0.1 + 0.9 * normalizedWeight})` : 
                                `rgba(255, 0, 0, ${0.1 + 0.9 * normalizedWeight})`;
                            
                            const lineWidth = 0.5 + 2.5 * normalizedWeight;
                            
                            // Dibujar conexión
                            ctx.beginPath();
                            ctx.strokeStyle = color;
                            ctx.lineWidth = lineWidth;
                            ctx.moveTo(prevX, prevY);
                            ctx.lineTo(x, y);
                            ctx.stroke();
                        }
                    }
                }
                
                // Dibujar neuronas
                for (let i = 0; i < neurons; i++) {
                    const y = startY + i * 2 * neuronRadius;
                    
                    // Determinar color de neurona por capa
                    let fillColor;
                    if (l === 0) fillColor = 'rgba(255, 165, 0, 0.8)'; // Entrada: naranja
                    else if (l === layers.length - 1) fillColor = 'rgba(50, 205, 50, 0.8)'; // Salida: verde
                    else fillColor = 'rgba(30, 144, 255, 0.8)'; // Oculta: azul
                    
                    // Dibujar neurona
                    ctx.beginPath();
                    ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
                    ctx.fillStyle = fillColor;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
            
            console.log('Estructura de la red actualizada');
        } catch (error) {
            console.error('Error al actualizar estructura de la red:', error);
        }
    }
    
    // Actualizar superficie de decisión
    updateDecisionSurface() {
        try {
            if (!this.currentModel || !this.elements.decisionSurface) return;
            
            const canvas = this.elements.decisionSurface;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Solo para redes con 2 entradas
            if (this.currentModel.config.inputDim !== 2) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = '16px Arial';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText('Solo disponible para redes con 2 entradas', canvas.width/2, canvas.height/2);
                return;
            }
            
            // Dimensiones
            const width = canvas.width;
            const height = canvas.height;
            
            // Crear superficie de decisión
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            
            // Rangos para x e y (entrada de la red)
            const xRange = { min: -2, max: 2 };
            const yRange = { min: -2, max: 2 };
            
            // Para cada pixel
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    // Convertir pixel a coordenadas de entrada
                    const inputX = xRange.min + (xRange.max - xRange.min) * (x / width);
                    const inputY = yRange.min + (yRange.max - yRange.min) * ((height - y) / height); // Invertido para que el eje Y apunte hacia arriba
                    
                    // Predecir con el modelo
                    const output = this.currentModel.predict([[inputX, inputY]]);
                    
                    // Índice del pixel en el array de datos
                    const idx = (y * width + x) * 4;
                    
                    // Asignar color según salida (asumiendo salida entre 0 y 1)
                    if (output[0].length === 1) {
                        // Escala de grises para salida unidimensional
                        const val = Math.floor(output[0][0] * 255);
                        data[idx] = val;     // R
                        data[idx + 1] = val; // G
                        data[idx + 2] = val; // B
                    } else if (output[0].length === 2) {
                        // Rojo vs Azul para salida bidimensional
                        data[idx] = Math.floor(output[0][0] * 255);     // R
                        data[idx + 1] = 0;                              // G
                        data[idx + 2] = Math.floor(output[0][1] * 255); // B
                    } else {
                        // Escala de colores para más dimensiones (simplificado)
                        const maxIdx = output[0].indexOf(Math.max(...output[0]));
                        const hue = (maxIdx / output[0].length) * 360;
                        const [r, g, b] = this.hslToRgb(hue / 360, 1, 0.5);
                        data[idx] = r;     // R
                        data[idx + 1] = g; // G
                        data[idx + 2] = b; // B
                    }
                    
                    // Alpha
                    data[idx + 3] = 255; // Alpha
                }
            }
            
            // Dibujar la imagen
            ctx.putImageData(imageData, 0, 0);
            
            // Dibujar puntos de datos si están disponibles
            if (this.trainingData) {
                const X = this.trainingData.X;
                const Y = this.trainingData.Y;
                
                for (let i = 0; i < X.length; i++) {
                    // Convertir coordenadas de datos a pixel
                    const pixelX = ((X[i][0] - xRange.min) / (xRange.max - xRange.min)) * width;
                    const pixelY = height - ((X[i][1] - yRange.min) / (yRange.max - yRange.min)) * height;
                    
                    // Determinar color por clase
                    let color;
                    if (Y[i].length === 1) {
                        // Escala de grises
                        const val = Math.floor((1 - Y[i][0]) * 255);
                        color = `rgb(${val},${val},${val})`;
                    } else if (Y[i].length === 2) {
                        // Rojo vs Azul
                        color = Y[i][0] > Y[i][1] ? 'red' : 'blue';
                    } else {
                        // Multiclase
                        const maxIdx = Y[i].indexOf(Math.max(...Y[i]));
                        const hue = (maxIdx / Y[i].length) * 360;
                        const [r, g, b] = this.hslToRgb(hue / 360, 1, 0.5);
                        color = `rgb(${r},${g},${b})`;
                    }
                    
                    // Dibujar punto
                    ctx.beginPath();
                    ctx.arc(pixelX, pixelY, 4, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
            
            console.log('Superficie de decisión actualizada');
        } catch (error) {
            console.error('Error al actualizar superficie de decisión:', error);
        }
    }
    
    // Generar reporte
    generateReport() {
        try {
            if (!this.currentModel) {
                alert('Entrene un modelo antes de generar el reporte');
                return;
            }
            
            // Obtener datos
            const studentName = this.elements.studentName ? this.elements.studentName.value || 'Estudiante' : 'Estudiante';
            const modelInfo = this.elements.modelInfo ? this.elements.modelInfo.value || '' : '';
            const analysis = this.elements.criticalAnalysis ? this.elements.criticalAnalysis.value || '' : '';
            
            // Crear contenido HTML
            const currentDate = new Date().toLocaleDateString();
            
            let reportHTML = `
                <div class="report">
                    <h1>Reporte de Entrenamiento de Red Neuronal</h1>
                    <p class="date">${currentDate}</p>
                    <h2>Estudiante: ${studentName}</h2>
                    
                    <h3>Configuración del Modelo</h3>
                    <ul>
                        <li><strong>Arquitectura:</strong> ${this.currentConfig.architecture}</li>
                        <li><strong>Función de Activación:</strong> ${this.currentConfig.activation}</li>
                        <li><strong>Tasa de Aprendizaje:</strong> ${this.currentConfig.learningRate}</li>
                        <li><strong>Épocas:</strong> ${this.epochCounter}</li>
                        <li><strong>Error Final (MSE):</strong> ${this.currentModel.lossHistory[this.currentModel.lossHistory.length - 1].toFixed(6)}</li>
                    </ul>
                    
                    <h3>Descripción del Modelo</h3>
                    <div class="description">
                        ${modelInfo.replace(/\n/g, '<br>')}
                    </div>
                    
                    <h3>Análisis Crítico</h3>
                    <div class="analysis">
                        ${analysis.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="visualizations">
                        <h3>Visualizaciones</h3>
                        <div class="visualization-container">
                            <h4>Evolución del Error</h4>
                            <img id="loss-chart-img" alt="Gráfico de pérdida" />
                        </div>
                        
                        <div class="visualization-container">
                            <h4>Estructura de la Red</h4>
                            <img id="network-structure-img" alt="Estructura de la red" />
                        </div>
                        
                        <div class="visualization-container">
                            <h4>Superficie de Decisión</h4>
                            <img id="decision-surface-img" alt="Superficie de decisión" />
                        </div>
                    </div>
                </div>
            `;
            
            // Mostrar vista previa
            if (this.elements.reportContent) {
                this.elements.reportContent.innerHTML = reportHTML;
            }
            
            // Capturar y agregar imágenes
            this.captureCanvasesToReport().then(() => {
                console.log('Reporte generado exitosamente');
                
                // Mostrar vista previa y botón de descarga
                if (this.elements.reportPreview) {
                    this.elements.reportPreview.classList.add('active');
                }
                
                if (this.elements.downloadReportBtn) {
                    this.elements.downloadReportBtn.disabled = false;
                }
            }).catch(error => {
                console.error('Error al capturar imágenes para el reporte:', error);
            });
        } catch (error) {
            console.error('Error al generar reporte:', error);
        }
    }
    
    // Capturar canvas para el reporte
    async captureCanvasesToReport() {
        try {
            // Capturar gráfico de pérdida
            if (this.elements.lossChart && this.charts.lossChart) {
                const lossChartImg = document.getElementById('loss-chart-img');
                if (lossChartImg) {
                    lossChartImg.src = this.elements.lossChart.toDataURL('image/png');
                }
            }
            
            // Capturar estructura de red
            if (this.elements.networkStructure) {
                const networkImg = document.getElementById('network-structure-img');
                if (networkImg) {
                    networkImg.src = this.elements.networkStructure.toDataURL('image/png');
                }
            }
            
            // Capturar superficie de decisión
            if (this.elements.decisionSurface) {
                const decisionImg = document.getElementById('decision-surface-img');
                if (decisionImg) {
                    decisionImg.src = this.elements.decisionSurface.toDataURL('image/png');
                }
            }
        } catch (error) {
            console.error('Error al capturar imágenes:', error);
            throw error;
        }
    }
    
    // Descargar reporte como PDF
    downloadReport() {
        try {
            if (!this.elements.reportContent) {
                alert('Primero genere un reporte');
                return;
            }
            
            const studentName = this.elements.studentName ? this.elements.studentName.value || 'Estudiante' : 'Estudiante';
            const filename = `reporte_${studentName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
            
            // Crear estilos para el PDF
            const style = `
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.5; }
                    h1 { text-align: center; color: #333; }
                    h2, h3, h4 { color: #444; }
                    .date { text-align: right; font-style: italic; }
                    .visualization-container { margin: 20px 0; }
                    img { max-width: 100%; height: auto; border: 1px solid #ddd; }
                    ul { padding-left: 20px; }
                    .description, .analysis { margin-bottom: 20px; text-align: justify; }
                </style>
            `;
            
            // Combinar HTML con estilos
            const htmlContent = style + this.elements.reportContent.innerHTML;
            
            // Crear PDF con html2pdf
            if (typeof html2pdf !== 'undefined') {
                const opt = {
                    margin: 10,
                    filename: filename,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                html2pdf().from(htmlContent).set(opt).save();
                console.log('Reporte descargado como PDF');
            } else {
                console.error('html2pdf no está disponible');
                alert('Error: La biblioteca para generar PDFs no está disponible');
            }
        } catch (error) {
            console.error('Error al descargar reporte:', error);
        }
    }
    
    // Utilidad para convertir HSL a RGB
    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}  // Fin de la clase ActivityApp

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando ActivityApp...');
    const app = new ActivityApp();
    app.init();
    window.activityApp = app; // Hacer accesible desde la consola para debugging
});
