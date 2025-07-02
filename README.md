# 🧠 Simulación Interactiva de Red Neuronal

Una aplicación web educativa que simula una red neuronal con descenso de gradiente, permitiendo visualizar en tiempo real cómo aprende la red y cómo se reduce la función de costo.

## 🎯 Características Principales

### ✨ Funcionalidades Educativas

- **Visualización de la Red Neuronal**: Representación gráfica de la arquitectura con neuronas, conexiones y pesos
- **Descenso de Gradiente en Tiempo Real**: Observa cómo se actualizan los pesos durante el entrenamiento
- **Gráfica de Función de Costo**: Visualización de la convergencia del error a lo largo de las épocas
- **Cálculos Paso a Paso**: Desglose matemático detallado de cada operación
- **Controles Interactivos**: Ajusta parámetros y observa los efectos inmediatamente

### 🔧 Controles Disponibles

- **Tasa de Aprendizaje**: Controla qué tan rápido aprende la red (0.01 - 1.0)
- **Salida Objetivo**: Define el valor que la red debe aprender a producir
- **Función de Activación**: Elige entre Sigmoid, Tanh o ReLU
- **Modos de Entrenamiento**: 
  - Entrenamiento continuo
  - Paso a paso para análisis detallado
  - Pausa y reinicio

### 📊 Visualizaciones

1. **Red Neuronal Interactiva**:
   - Neuronas con colores que representan activaciones
   - Conexiones con grosor proporcional al peso
   - Colores verde/rojo para pesos positivos/negativos
   - Etiquetas dinámicas de pesos y bias

2. **Gráfica de Convergencia**:
   - Evolución del error en tiempo real
   - Ejes escalados automáticamente
   - Puntos de datos para análisis detallado

3. **Panel de Cálculos**:
   - Forward pass paso a paso
   - Backward pass con gradientes
   - Actualización de pesos explicada

## 🏗️ Arquitectura de la Red

La simulación implementa una red neuronal feedforward con:

- **Capa de Entrada**: 2 neuronas (valores fijos: [1, 0])
- **Capa Oculta**: 2 neuronas con bias
- **Capa de Salida**: 1 neurona con bias

### Pesos Iniciales (según imagen de referencia):
```
w1 = 1.0    (entrada 1 → neurona oculta 1)
w2 = 0.5    (entrada 0 → neurona oculta 1)
w3 = 1.0    (entrada 1 → neurona oculta 2)
w4 = -0.5   (entrada 0 → neurona oculta 2)
w5 = 1.0    (neurona oculta 1 → salida)
w6 = 1.0    (neurona oculta 2 → salida)

b1 = 0.5    (bias neurona oculta 1)
b2 = 0.0    (bias neurona oculta 2)
b3 = 0.5    (bias neurona de salida)
```

## 🧮 Algoritmo Implementado

### Forward Pass
1. **Capa Oculta**:
   ```
   z1 = (input1 × w1) + (input2 × w2) + b1
   a1 = σ(z1)
   
   z2 = (input1 × w3) + (input2 × w4) + b2
   a2 = σ(z2)
   ```

2. **Capa de Salida**:
   ```
   z3 = (a1 × w5) + (a2 × w6) + b3
   output = σ(z3)
   ```

3. **Función de Costo**:
   ```
   Error = 0.5 × (target - output)²
   ```

### Backward Pass (Retropropagación)
1. **Gradientes de Salida**:
   ```
   δ3 = (output - target) × σ'(output)
   dW5 = δ3 × a1
   dW6 = δ3 × a2
   dB3 = δ3
   ```

2. **Gradientes de Capa Oculta**:
   ```
   δ1 = δ3 × w5 × σ'(a1)
   δ2 = δ3 × w6 × σ'(a2)
   
   dW1 = δ1 × input1
   dW2 = δ1 × input2
   dW3 = δ2 × input1
   dW4 = δ2 × input2
   dB1 = δ1
   dB2 = δ2
   ```

3. **Actualización de Pesos**:
   ```
   w_new = w_old - α × dW
   b_new = b_old - α × dB
   ```

## 🚀 Uso de la Aplicación

### Inicio Rápido
1. Abre `index_simple.html` en tu navegador
2. Observa la red neuronal y sus valores iniciales
3. Ajusta los parámetros según tus necesidades
4. Haz clic en "Iniciar Entrenamiento" para ver el aprendizaje automático
5. Usa "Paso a Paso" para análisis detallado

### Controles de Teclado
- **Espacio**: Iniciar/Pausar entrenamiento
- **R**: Reiniciar red neuronal
- **S**: Ejecutar un paso de entrenamiento

### Experimentos Sugeridos

1. **Efecto de la Tasa de Aprendizaje**:
   - Prueba con α = 0.01 (lento pero estable)
   - Prueba con α = 0.5 (rápido pero puede oscilar)
   - Prueba con α = 1.0 (muy rápido, puede diverger)

2. **Diferentes Funciones de Activación**:
   - Sigmoid: Suave, valores entre 0 y 1
   - Tanh: Suave, valores entre -1 y 1
   - ReLU: Lineal para valores positivos

3. **Objetivos de Aprendizaje**:
   - Target = 0.5: Fácil de alcanzar
   - Target = 0.1: Requiere más entrenamiento
   - Target = 0.9: Observa la saturación

## 📁 Estructura de Archivos

```
neural-network-simulator/
├── index_simple.html          # Aplicación principal
├── neuralNetwork.js           # Lógica de la red neuronal
├── simpleVisualization.js     # Visualizaciones con Canvas
├── simpleApp.js              # Controlador principal
├── README.md                 # Esta documentación
└── neural_network_analysis.md # Análisis técnico
```

## 🎓 Valor Educativo

Esta simulación es ideal para:

- **Estudiantes de Machine Learning**: Comprender conceptos fundamentales
- **Profesores**: Demostrar algoritmos de manera visual
- **Desarrolladores**: Ver implementación práctica de redes neuronales
- **Investigadores**: Experimentar con parámetros y observar efectos

### Conceptos Demostrados

1. **Forward Propagation**: Cómo fluyen los datos a través de la red
2. **Backward Propagation**: Cómo se calculan y propagan los gradientes
3. **Gradient Descent**: Cómo se optimizan los pesos
4. **Función de Costo**: Cómo se mide y reduce el error
5. **Convergencia**: Cómo la red aprende a aproximar la función objetivo

## 🔬 Aspectos Técnicos

### Tecnologías Utilizadas
- **HTML5 Canvas**: Para visualizaciones de alta performance
- **JavaScript ES6+**: Lógica moderna y eficiente
- **CSS3**: Diseño responsivo y atractivo
- **Sin dependencias externas**: Funciona offline

### Optimizaciones Implementadas
- Renderizado eficiente con Canvas nativo
- Limitación de puntos en gráficas para performance
- Actualización selectiva de elementos visuales
- Gestión de memoria para historial de costos

## 🎯 Casos de Uso

### En el Aula
- Introducción a redes neuronales
- Demostración de gradient descent
- Análisis de hiperparámetros
- Comparación de funciones de activación

### Autoaprendizaje
- Experimentación interactiva
- Comprensión visual de conceptos
- Análisis paso a paso de algoritmos
- Validación de conocimientos teóricos

### Investigación
- Prototipado rápido de ideas
- Visualización de comportamientos
- Testing de parámetros
- Comunicación de resultados

## 🚀 Próximas Mejoras

- Soporte para múltiples capas ocultas
- Diferentes algoritmos de optimización (Adam, RMSprop)
- Datasets personalizables
- Exportación de resultados
- Modo de comparación de algoritmos

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y de investigación.

---

**¡Explora, experimenta y aprende sobre redes neuronales de manera interactiva!** 🧠✨

