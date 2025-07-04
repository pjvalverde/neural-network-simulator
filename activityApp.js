/**
 * Aplicación para la Actividad de Entrenamiento de Redes Neuronales Vectoriales
 */

// Definición como objeto en lugar de clase para compatibilidad con el HTML existente
const ActivityApp = {
    // Variables globales de la aplicación
    currentModel: null,
    trainingData: null,
    currentConfig: {
        architecture: '2-3-2',
        learningRate: 0.1,
        epochs: 1000,
        activation: 'relu'
    },
    trainingInProgress: false,
    epochCounter: 0,
    savedModels: [],
    charts: {}, // Para almacenar las referencias a los gráficos
    elements: {}, // Para almacenar referencias a elementos del DOM

    // Inicializar la aplicación
    init: function() {
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
            
            // Cambiar a la pestaña de entrenamiento
            this.changeTab('training');
            
            console.log('🧠 Aplicación de Actividad de Redes Neuronales inicializada');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
        }
    },
    
    // Cargar referencias a elementos de la UI
    loadUIElements: function() {
        console.log('Cargando elementos UI');
        
        try {
            // Tab navigation
            this.elements.tabs = document.querySelectorAll('.tab');
            this.elements.tabContents = document.querySelectorAll('.tab-content');
            
            // Training controls
            this.elements.architecture = document.getElementById('architecture');
            this.elements.learningRate = document.getElementById('learning-rate');
            this.elements.epochs = document.getElementById('epochs');
            this.elements.activation = document.getElementById('activation');
            this.elements.trainButton = document.getElementById('train-model');
            this.elements.saveButton = document.getElementById('save-model');
            this.elements.resetButton = document.getElementById('reset-model');
            
            console.log('Elementos UI cargados');
        } catch (error) {
            console.error('Error al cargar elementos UI:', error);
        }
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        console.log('Configurando event listeners');
        
        try {
            // Tabs navigation
            if (this.elements.tabs) {
                this.elements.tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabId = tab.getAttribute('data-tab');
                        this.changeTab(tabId);
                    });
                });
            }
            
            // Training controls
            if (this.elements.architecture) {
                this.elements.architecture.addEventListener('change', () => {
                    this.currentConfig.architecture = this.elements.architecture.value;
                    this.resetModel();
                });
            }
            
            console.log('Event listeners configurados');
        } catch (error) {
            console.error('Error al configurar event listeners:', error);
        }
    },
    
    // Inicializar pestañas
    initTabs: function() {
        try {
            // Inicializar gráficos
            this.initLossChart();
            
            // Crear modelo inicial
            this.createModel();
            
            console.log('Pestañas inicializadas');
        } catch (error) {
            console.error('Error al inicializar pestañas:', error);
        }
    },
    
    // Cambiar entre pestañas
    changeTab: function(tabId) {
        try {
            console.log(`Cambiando a pestaña: ${tabId}`);
            // Ocultar todas las pestañas
            if (this.elements.tabs && this.elements.tabContents) {
                this.elements.tabs.forEach(tab => tab.classList.remove('active'));
                this.elements.tabContents.forEach(content => content.classList.remove('active'));
                
                // Activar la pestaña seleccionada
                const selectedTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
                const selectedContent = document.getElementById(`${tabId}-tab`);
                
                if (selectedTab && selectedContent) {
                    selectedTab.classList.add('active');
                    selectedContent.classList.add('active');
                }
            }
        } catch (error) {
            console.error('Error al cambiar de pestaña:', error);
        }
    },
    
    // Generar datos de entrenamiento
    generateTrainingData: function() {
        try {
            console.log('Generando datos de entrenamiento');
            
            // Usar la función integrada en VectorNN para generar datos AND-OR con ruido
            if (typeof VectorNN !== 'undefined' && VectorNN.generateLogicalOperatorData) {
                this.trainingData = VectorNN.generateLogicalOperatorData(100, 0.05);
                console.log('Datos generados');
            } else {
                console.error('VectorNN no está definido o no tiene el método generateLogicalOperatorData');
            }
        } catch (error) {
            console.error('Error al generar datos de entrenamiento:', error);
        }
    },

    // Crear modelo de red neuronal
    createModel: function() {
        try {
            console.log('Creando modelo de red neuronal');
            
            // Obtener arquitectura desde configuración
            const archStr = this.currentConfig.architecture;
            console.log('Arquitectura:', archStr);
            
            // Parsear arquitectura (formato: "2-4-2" para capas de 2, 4 y 2 neuronas)
            const layers = archStr.split('-').map(Number);
            
            // Verificar formato válido
            if (layers.length < 2) {
                console.error('Arquitectura inválida. Debe tener al menos capas de entrada y salida.');
                return;
            }
            
            // Crear configuración para VectorNN
            const inputDim = layers[0];
            const outputDim = layers[layers.length - 1];
            const hiddenDims = layers.slice(1, -1);
            
            const config = {
                inputDim: inputDim,
                hiddenDims: hiddenDims,
                outputDim: outputDim,
                activation: this.currentConfig.activation,
                learningRate: this.currentConfig.learningRate
            };
            
            console.log('Configuración del modelo:', config);
            
            // Crear modelo
            if (typeof VectorNN === 'undefined') {
                console.error('Error: VectorNN no está definido');
                return;
            }
            
            this.currentModel = new VectorNN(config);
            this.epochCounter = 0;
            
            console.log('Modelo creado exitosamente');
        } catch (error) {
            console.error('Error al crear modelo:', error);
        }
    },
    
    // Inicializar gráfico de pérdida
    initLossChart: function() {
        try {
            console.log('Inicializando gráfico de pérdida');
        } catch (error) {
            console.error('Error al inicializar gráfico de pérdida:', error);
        }
    },
    
    // Reiniciar modelo
    resetModel: function() {
        try {
            console.log('Reiniciando modelo');
            this.createModel();
        } catch (error) {
            console.error('Error al reiniciar modelo:', error);
        }
    }
};
