# 📚 Guía para Subir el Proyecto a GitHub

## 🚀 Opción 1: Usando GitHub Web (Más Fácil)

### Paso 1: Crear Repositorio
1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón verde "New" o "+" → "New repository"
3. Nombra tu repositorio: `neural-network-simulator`
4. Agrega descripción: `Simulación interactiva de red neuronal con gradient descent`
5. Marca "Add a README file"
6. Haz clic en "Create repository"

### Paso 2: Subir Archivos
1. En tu nuevo repositorio, haz clic en "uploading an existing file"
2. Arrastra estos archivos desde tu computadora:
   - `index_simple.html` (archivo principal)
   - `neuralNetwork.js`
   - `simpleVisualization.js`
   - `simpleApp.js`
   - `README.md`

### Paso 3: Activar GitHub Pages
1. Ve a Settings → Pages (en el menú lateral)
2. En "Source", selecciona "Deploy from a branch"
3. Selecciona "main" branch
4. Haz clic en "Save"
5. ¡Tu sitio estará disponible en: `https://tu-usuario.github.io/neural-network-simulator`!

---

## 💻 Opción 2: Usando Git (Línea de Comandos)

### Requisitos Previos
- Tener Git instalado
- Cuenta de GitHub configurada

### Comandos
```bash
# 1. Crear repositorio local
git init
git add .
git commit -m "Initial commit: Neural Network Simulator"

# 2. Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/neural-network-simulator.git
git branch -M main
git push -u origin main

# 3. Para activar GitHub Pages
# Ve a Settings → Pages en GitHub y configura como en Opción 1
```

---

## 🌐 Configuración de GitHub Pages

### Archivo Principal
Asegúrate de que tu archivo principal se llame `index.html` para GitHub Pages.

**Opción A:** Renombrar archivo
- Cambia `index_simple.html` → `index.html`

**Opción B:** Crear index.html que redirija
```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=index_simple.html">
</head>
<body>
    <p>Redirecting to Neural Network Simulator...</p>
</body>
</html>
```

---

## 📁 Estructura Final del Repositorio

```
neural-network-simulator/
├── index.html                 # Archivo principal (renombrado)
├── neuralNetwork.js           # Lógica de la red neuronal
├── simpleVisualization.js     # Visualizaciones
├── simpleApp.js              # Aplicación principal
├── README.md                 # Documentación
└── GITHUB_SETUP.md           # Esta guía
```

---

## 🎯 Ventajas de GitHub

### Para Ti
- ✅ Backup automático de tu código
- ✅ Control de versiones
- ✅ Hosting gratuito con GitHub Pages
- ✅ Portafolio profesional

### Para Compartir
- ✅ URL pública: `https://tu-usuario.github.io/neural-network-simulator`
- ✅ Código fuente visible para otros desarrolladores
- ✅ Fácil de clonar y modificar
- ✅ Contribuciones de la comunidad

---

## 🔧 Personalización del README

Agrega estas secciones a tu README.md:

```markdown
## 🌐 Demo en Vivo
[Ver Simulación](https://tu-usuario.github.io/neural-network-simulator)

## 🛠️ Instalación Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/neural-network-simulator.git
   ```
2. Abre `index.html` en tu navegador

## 🤝 Contribuciones
¡Las contribuciones son bienvenidas! Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request
```

---

## 📈 Próximos Pasos

1. **Sube el proyecto a GitHub**
2. **Activa GitHub Pages**
3. **Comparte tu URL pública**
4. **Agrega el proyecto a tu portafolio**
5. **Considera agregar más features**

---

## 🆘 Ayuda Adicional

- [Documentación GitHub Pages](https://pages.github.com/)
- [Guía Git Básica](https://git-scm.com/docs/gittutorial)
- [Markdown Guide](https://www.markdownguide.org/)

¡Tu simulación de red neuronal estará disponible públicamente en GitHub! 🚀

