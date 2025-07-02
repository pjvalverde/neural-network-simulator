/**
 * Visualización simplificada de la Red Neuronal usando Canvas nativo
 */
class SimpleNetworkVisualizer {
    constructor(canvasId, network) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.network = network;
        
        // Configurar canvas
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Posiciones de las neuronas
        this.neuronPositions = {
            inputs: [
                { x: 80, y: 120, label: '1', value: 1 },
                { x: 80, y: 280, label: '0', value: 0 }
            ],
            hidden: [
                { x: 300, y: 120, label: '1', id: 'h1' },
                { x: 300, y: 280, label: '2', id: 'h2' }
            ],
            output: [
                { x: 520, y: 200, label: '3', id: 'out' }
            ]
        };
        
        this.neuronRadius = 30;
        this.animationFrame = null;
        this.highlightedNeurons = new Set();
        
        this.draw();
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Dibujar conexiones
        this.drawConnections();
        
        // Dibujar neuronas
        this.drawNeurons();
        
        // Dibujar etiquetas
        this.drawLabels();
    }
    
    drawConnections() {
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
        
        connections.forEach(conn => {
            const weight = this.network.weights[conn.weight];
            const thickness = Math.max(1, Math.min(8, Math.abs(weight) * 4));
            const color = weight >= 0 ? '#48bb78' : '#f56565';
            
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = thickness;
            this.ctx.stroke();
            
            // Dibujar peso en el medio de la conexión
            const midX = (conn.from.x + conn.to.x) / 2;
            const midY = (conn.from.y + conn.to.y) / 2 - 10;
            
            this.ctx.fillStyle = '#4a5568';
            this.ctx.font = '12px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${conn.weight}: ${weight.toFixed(2)}`, midX, midY);
        });
    }
    
    drawNeurons() {
        // Neuronas de entrada
        this.neuronPositions.inputs.forEach((neuron, i) => {
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, this.neuronRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#48bb78';
            this.ctx.fill();
            this.ctx.strokeStyle = '#2d3748';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
        
        // Neuronas ocultas
        this.neuronPositions.hidden.forEach((neuron, i) => {
            const activation = this.network.hiddenLayer[i];
            const intensity = Math.min(255, Math.max(0, activation * 255));
            const color = `rgb(${255 - intensity}, ${intensity}, 100)`;
            
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, this.neuronRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            
            // Efecto de procesamiento
            if (this.highlightedNeurons.has(neuron.id)) {
                this.ctx.strokeStyle = '#f56565';
                this.ctx.lineWidth = 4;
            } else {
                this.ctx.strokeStyle = '#2d3748';
                this.ctx.lineWidth = 2;
            }
            this.ctx.stroke();
        });
        
        // Neurona de salida
        this.neuronPositions.output.forEach((neuron, i) => {
            const activation = this.network.output;
            const intensity = Math.min(255, Math.max(0, activation * 255));
            const color = `rgb(${255 - intensity}, ${intensity}, 100)`;
            
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, this.neuronRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            
            if (this.highlightedNeurons.has(neuron.id)) {
                this.ctx.strokeStyle = '#f56565';
                this.ctx.lineWidth = 4;
            } else {
                this.ctx.strokeStyle = '#2d3748';
                this.ctx.lineWidth = 2;
            }
            this.ctx.stroke();
        });
    }
    
    drawLabels() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Etiquetas de neuronas de entrada
        this.neuronPositions.inputs.forEach(neuron => {
            this.ctx.fillText(neuron.label, neuron.x, neuron.y);
        });
        
        // Etiquetas de neuronas ocultas
        this.neuronPositions.hidden.forEach(neuron => {
            this.ctx.fillText(neuron.label, neuron.x, neuron.y);
        });
        
        // Etiqueta de neurona de salida
        this.neuronPositions.output.forEach(neuron => {
            this.ctx.fillText(neuron.label, neuron.x, neuron.y);
        });
        
        // Etiquetas de bias
        this.ctx.fillStyle = '#4a5568';
        this.ctx.font = '12px monospace';
        
        const biasPositions = [
            { x: this.neuronPositions.hidden[0].x, y: this.neuronPositions.hidden[0].y + 50, bias: 'b1' },
            { x: this.neuronPositions.hidden[1].x, y: this.neuronPositions.hidden[1].y + 50, bias: 'b2' },
            { x: this.neuronPositions.output[0].x, y: this.neuronPositions.output[0].y + 50, bias: 'b3' }
        ];
        
        biasPositions.forEach(pos => {
            this.ctx.fillText(`${pos.bias}: ${this.network.biases[pos.bias].toFixed(2)}`, pos.x, pos.y);
        });
    }
    
    update() {
        this.draw();
    }
    
    highlightNeuron(neuronId, duration = 1000) {
        this.highlightedNeurons.add(neuronId);
        this.draw();
        
        setTimeout(() => {
            this.highlightedNeurons.delete(neuronId);
            this.draw();
        }, duration);
    }
    
    animateForwardPass() {
        setTimeout(() => this.highlightNeuron('h1'), 100);
        setTimeout(() => this.highlightNeuron('h2'), 200);
        setTimeout(() => this.highlightNeuron('out'), 400);
    }
}

/**
 * Gráfica simplificada de función de costo usando Canvas
 */
class SimpleCostChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.margin = 40;
        this.costHistory = [];
        this.maxPoints = 200;
        
        this.draw();
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Dibujar ejes
        this.drawAxes();
        
        // Dibujar datos si existen
        if (this.costHistory.length > 1) {
            this.drawCostLine();
        }
        
        // Dibujar título
        this.drawTitle();
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 2;
        
        // Eje Y
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin, this.margin);
        this.ctx.lineTo(this.margin, this.height - this.margin);
        this.ctx.stroke();
        
        // Eje X
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin, this.height - this.margin);
        this.ctx.lineTo(this.width - this.margin, this.height - this.margin);
        this.ctx.stroke();
        
        // Etiquetas de ejes
        this.ctx.fillStyle = '#4a5568';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Época', this.width / 2, this.height - 10);
        
        this.ctx.save();
        this.ctx.translate(15, this.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Error', 0, 0);
        this.ctx.restore();
    }
    
    drawCostLine() {
        if (this.costHistory.length < 2) return;
        
        const maxError = Math.max(...this.costHistory);
        const minError = Math.min(...this.costHistory);
        const errorRange = maxError - minError || 1;
        
        const plotWidth = this.width - 2 * this.margin;
        const plotHeight = this.height - 2 * this.margin;
        
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        this.costHistory.forEach((error, index) => {
            const x = this.margin + (index / (this.costHistory.length - 1)) * plotWidth;
            const y = this.height - this.margin - ((error - minError) / errorRange) * plotHeight;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Dibujar puntos
        this.ctx.fillStyle = '#667eea';
        this.costHistory.forEach((error, index) => {
            if (index % Math.max(1, Math.floor(this.costHistory.length / 50)) === 0) {
                const x = this.margin + (index / (this.costHistory.length - 1)) * plotWidth;
                const y = this.height - this.margin - ((error - minError) / errorRange) * plotHeight;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });
        
        // Mostrar valores en los ejes
        this.ctx.fillStyle = '#4a5568';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right';
        
        // Valores del eje Y
        for (let i = 0; i <= 5; i++) {
            const value = minError + (errorRange * i / 5);
            const y = this.height - this.margin - (i / 5) * plotHeight;
            this.ctx.fillText(value.toFixed(4), this.margin - 5, y + 3);
        }
        
        // Valores del eje X
        this.ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            const value = Math.floor((this.costHistory.length - 1) * i / 5);
            const x = this.margin + (i / 5) * plotWidth;
            this.ctx.fillText(value.toString(), x, this.height - this.margin + 15);
        }
    }
    
    drawTitle() {
        this.ctx.fillStyle = '#4a5568';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Convergencia del Error', this.width / 2, 20);
    }
    
    update(costHistory) {
        this.costHistory = [...costHistory];
        
        // Limitar puntos para rendimiento
        if (this.costHistory.length > this.maxPoints) {
            const step = Math.floor(this.costHistory.length / this.maxPoints);
            this.costHistory = this.costHistory.filter((_, index) => index % step === 0);
        }
        
        this.draw();
    }
    
    reset() {
        this.costHistory = [];
        this.draw();
    }
}

