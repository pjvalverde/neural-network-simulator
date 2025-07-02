/**
 * Clase para visualizar la Red Neuronal usando D3.js
 */
class NetworkVisualizer {
    constructor(svgId, network) {
        this.svg = d3.select(`#${svgId}`);
        this.network = network;
        this.width = 600;
        this.height = 400;
        this.margin = 50;
        
        // Configuración de las posiciones de las neuronas
        this.neuronPositions = {
            inputs: [
                { x: this.margin, y: this.height / 3, label: '1', value: 1 },
                { x: this.margin, y: 2 * this.height / 3, label: '0', value: 0 }
            ],
            hidden: [
                { x: this.width / 2, y: this.height / 3, label: '1', id: 'h1' },
                { x: this.width / 2, y: 2 * this.height / 3, label: '2', id: 'h2' }
            ],
            output: [
                { x: this.width - this.margin, y: this.height / 2, label: '3', id: 'out' }
            ]
        };
        
        this.neuronRadius = 25;
        this.setupSVG();
        this.createConnections();
        this.createNeurons();
        this.createLabels();
    }
    
    setupSVG() {
        this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Limpiar SVG
        this.svg.selectAll('*').remove();
        
        // Crear grupos para organizar elementos
        this.connectionsGroup = this.svg.append('g').attr('class', 'connections');
        this.neuronsGroup = this.svg.append('g').attr('class', 'neurons');
        this.labelsGroup = this.svg.append('g').attr('class', 'labels');
    }
    
    createConnections() {
        const connections = [
            // Entrada a capa oculta
            { from: this.neuronPositions.inputs[0], to: this.neuronPositions.hidden[0], weight: 'w1' },
            { from: this.neuronPositions.inputs[1], to: this.neuronPositions.hidden[0], weight: 'w2' },
            { from: this.neuronPositions.inputs[0], to: this.neuronPositions.hidden[1], weight: 'w3' },
            { from: this.neuronPositions.inputs[1], to: this.neuronPositions.hidden[1], weight: 'w4' },
            // Capa oculta a salida
            { from: this.neuronPositions.hidden[0], to: this.neuronPositions.output[0], weight: 'w5' },
            { from: this.neuronPositions.hidden[1], to: this.neuronPositions.output[0], weight: 'w6' }
        ];
        
        this.connections = this.connectionsGroup.selectAll('.connection')
            .data(connections)
            .enter()
            .append('line')
            .attr('class', 'connection')
            .attr('x1', d => d.from.x)
            .attr('y1', d => d.from.y)
            .attr('x2', d => d.to.x)
            .attr('y2', d => d.to.y);
        
        // Etiquetas de pesos
        this.weightLabels = this.labelsGroup.selectAll('.weight-label')
            .data(connections)
            .enter()
            .append('text')
            .attr('class', 'weight-label')
            .attr('x', d => (d.from.x + d.to.x) / 2)
            .attr('y', d => (d.from.y + d.to.y) / 2 - 5)
            .text(d => `${d.weight}: ${this.network.weights[d.weight].toFixed(2)}`);
    }
    
    createNeurons() {
        // Neuronas de entrada
        this.inputNeurons = this.neuronsGroup.selectAll('.input-neuron')
            .data(this.neuronPositions.inputs)
            .enter()
            .append('circle')
            .attr('class', 'neuron input')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', this.neuronRadius);
        
        // Neuronas ocultas
        this.hiddenNeurons = this.neuronsGroup.selectAll('.hidden-neuron')
            .data(this.neuronPositions.hidden)
            .enter()
            .append('circle')
            .attr('class', 'neuron hidden')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', this.neuronRadius);
        
        // Neurona de salida
        this.outputNeuron = this.neuronsGroup.selectAll('.output-neuron')
            .data(this.neuronPositions.output)
            .enter()
            .append('circle')
            .attr('class', 'neuron output')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', this.neuronRadius);
    }
    
    createLabels() {
        // Etiquetas de neuronas de entrada
        this.labelsGroup.selectAll('.input-label')
            .data(this.neuronPositions.inputs)
            .enter()
            .append('text')
            .attr('class', 'neuron-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .text(d => d.label);
        
        // Etiquetas de neuronas ocultas
        this.labelsGroup.selectAll('.hidden-label')
            .data(this.neuronPositions.hidden)
            .enter()
            .append('text')
            .attr('class', 'neuron-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .text(d => d.label);
        
        // Etiqueta de neurona de salida
        this.labelsGroup.selectAll('.output-label')
            .data(this.neuronPositions.output)
            .enter()
            .append('text')
            .attr('class', 'neuron-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .text(d => d.label);
        
        // Etiquetas de bias
        const biasPositions = [
            { x: this.neuronPositions.hidden[0].x, y: this.neuronPositions.hidden[0].y + 40, bias: 'b1' },
            { x: this.neuronPositions.hidden[1].x, y: this.neuronPositions.hidden[1].y + 40, bias: 'b2' },
            { x: this.neuronPositions.output[0].x, y: this.neuronPositions.output[0].y + 40, bias: 'b3' }
        ];
        
        this.biasLabels = this.labelsGroup.selectAll('.bias-label')
            .data(biasPositions)
            .enter()
            .append('text')
            .attr('class', 'weight-label')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .text(d => `${d.bias}: ${this.network.biases[d.bias].toFixed(2)}`);
    }
    
    update() {
        // Actualizar colores de neuronas basado en activación
        this.hiddenNeurons
            .style('fill', (d, i) => {
                const activation = this.network.hiddenLayer[i];
                const intensity = Math.min(255, Math.max(0, activation * 255));
                return `rgb(${255 - intensity}, ${intensity}, 100)`;
            });
        
        this.outputNeuron
            .style('fill', () => {
                const activation = this.network.output;
                const intensity = Math.min(255, Math.max(0, activation * 255));
                return `rgb(${255 - intensity}, ${intensity}, 100)`;
            });
        
        // Actualizar grosor de conexiones basado en peso
        this.connections
            .style('stroke-width', d => {
                const weight = Math.abs(this.network.weights[d.weight]);
                return Math.max(1, Math.min(6, weight * 3));
            })
            .style('stroke', d => {
                const weight = this.network.weights[d.weight];
                return weight >= 0 ? '#48bb78' : '#f56565';
            });
        
        // Actualizar etiquetas de pesos
        this.weightLabels
            .text(d => `${d.weight}: ${this.network.weights[d.weight].toFixed(2)}`);
        
        // Actualizar etiquetas de bias
        this.biasLabels
            .text(d => `${d.bias}: ${this.network.biases[d.bias].toFixed(2)}`);
    }
    
    highlightNeuron(neuronId, duration = 1000) {
        let neuron;
        switch(neuronId) {
            case 'h1':
                neuron = this.hiddenNeurons.filter((d, i) => i === 0);
                break;
            case 'h2':
                neuron = this.hiddenNeurons.filter((d, i) => i === 1);
                break;
            case 'out':
                neuron = this.outputNeuron;
                break;
        }
        
        if (neuron) {
            neuron.classed('processing', true);
            setTimeout(() => {
                neuron.classed('processing', false);
            }, duration);
        }
    }
    
    animateForwardPass() {
        // Animar el flujo de datos
        setTimeout(() => this.highlightNeuron('h1'), 100);
        setTimeout(() => this.highlightNeuron('h2'), 200);
        setTimeout(() => this.highlightNeuron('out'), 400);
    }
}

/**
 * Clase para la gráfica de función de costo
 */
class CostChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar Chart.js
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Función de Costo',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Época'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Error'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Convergencia del Error durante el Entrenamiento'
                    }
                },
                animation: {
                    duration: 0 // Desactivar animación para mejor rendimiento
                }
            }
        });
    }
    
    update(costHistory) {
        const maxPoints = 100; // Limitar puntos para rendimiento
        const step = Math.max(1, Math.floor(costHistory.length / maxPoints));
        
        const labels = [];
        const data = [];
        
        for (let i = 0; i < costHistory.length; i += step) {
            labels.push(i);
            data.push(costHistory[i]);
        }
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update('none'); // Sin animación
    }
    
    reset() {
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    }
}

