# uberlawyerBETA – Plataforma On-Demand de Abogados

![uberlawyerBETA](https://img.shields.io/badge/Status-Beta%20Ready-05a357?style=for-the-badge)
![Location](https://img.shields.io/badge/Location-Cali%2C%20Colombia-3b82f6?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20TailwindCSS%20%7C%20Leaflet%20%7C%20Gemini%20AI-black?style=for-the-badge)

**uberlawyerBETA** es una aplicación web de una sola página (SPA) moderna, ultra limpia e intuitiva inspirada en la interfaz de **Uber** y **Uber Driver**, diseñada para conectar a ciudadanos en Cali, Colombia con abogados en ejercicio en tiempo real para atención legal inmediata o programada.

---

## 🌟 Características Principales

1. **Interfaz Estilo Uber (UI/UX Minimalista)**:
   - Paleta de colores `#000000` con acentos de alta legibilidad `#05a357` (verde Uber).
   - Componentes flotantes con efecto glassmorphism (transparencias y blurs).
   - Botón inferior estilo **Uber Driver** con animación de escaneo radar.

2. **Cuestionario Flotante de Emergencia / No Emergencia**:
   - Pregunta inicial: *"¿Esto es una emergencia?"*
   - **Flujo Urgente (Sí)**: Selección rápida entre *Penal*, *Civil*, *Especialista en Tránsito* y *Especialista en Narcotráfico*.
   - **Flujo Consulta (No)**: Cuestionario guiado técnico por área legal (*Laboral*, *Civil*, *Familia*, *Comercial*, *Administrativo*) y estado actual del proceso.

3. **Módulo de Nota de Voz & Procesamiento con IA Google Gemini**:
   - Captura de audio en tiempo real con la `MediaRecorder API` (hasta 60 segundos).
   - Integración directa mediante la API REST de **Google Gemini** (`gemini-2.5-flash` / `gemini-2.5-pro` / configurable) para clasificar automáticamente la urgencia del caso y sugerir la especialidad adecuada.
   - **Modo Test / Simulación**: Funciona al 100% incluso sin clave de API activa mediante clasificación simulada.

4. **Mapa Interactivo Centrado en Cali, Colombia**:
   - Integrado con **Leaflet.js** y mosaicos minimalistas CartoDB Positron / OpenStreetMap.
   - Geolocalización automática en tiempo real con marcador azul pulsante (`3.4516, -76.5320` por defecto en Cali).
   - Cálculo dinámico de distancias en kilómetros utilizando la **Fórmula de Haversine** y estimación de tiempos de llegada (ETA).
   - Directorio de más de 10 abogados activos en barrios representativos de Cali: Granada, San Fernando, Ciudad Jardín, El Peñón, Santa Mónica, San Antonio, Chipichape, Valle del Lili, Tequendama y Versalles.

5. **Videollamadas Cifradas en Vivo (Jitsi Meet)**:
   - Al confirmar el abogado asignado, inicia una videollamada cifrada P2P directa desde el navegador utilizando la API Externa de **Jitsi Meet**.
   - Modal de pantalla completa con controles de micrófono, cámara, cronómetro de consulta y botón de finalización.

---

## 🛠️ Estructura del Proyecto

```text
uberlawyerBETA/
├── index.html              # Estructura principal, modales y contenedores
├── css/
│   └── styles.css          # Estilos personalizados, pulsos de mapa y animaciones radar
├── js/
│   ├── app.js              # Controlador principal de UI, orquestador de eventos y flujos
│   ├── lawyersData.js      # Base de datos local de abogados en Cali y cálculo Haversine
│   ├── mapController.js    # Inicialización de Leaflet, marcadores y escaneo radar
│   ├── audioRecorder.js    # Lógica de MediaRecorder y captura de notas de voz
│   ├── googleApiTest.js    # Integración REST con Google Gemini API y Modo Test
│   └── videoCall.js        # Integración con Jitsi Meet External API
└── README.md               # Documentación y guía de despliegue
```

---

## 🚀 Despliegue en GitHub Pages

Este proyecto utiliza únicamente código estático (HTML5, CSS3, JavaScript ES6+ modular) y no requiere servidores ni backendNode.js, lo que lo hace 100% compatible con **GitHub Pages**.

### Pasos para publicar:

1. **Subir el repositorio a GitHub**:
   ```bash
   git add .
   git commit -m "feat: uberlawyerBETA app completa"
   git push origin main
   ```

2. **Activar GitHub Pages**:
   - Ve a la pestaña **Settings** (Configuración) de tu repositorio en GitHub.
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - En **Source** (Fuente), selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
   - Haz clic en **Save** (Guardar).

3. **¡Listo!**: En pocos segundos tu aplicación estará accesible públicamente en la URL proporcionada por GitHub (ej. `https://tu-usuario.github.io/uberlawyerBETA/`).

---

## 🔑 Configuración de Google Gemini API (Opcional)

1. Obtén tu clave gratuita en [Google AI Studio](https://aistudio.google.com/).
2. Haz clic en el botón **IA Google Gemini** en la esquina superior derecha de la aplicación.
3. Ingresa tu API Key y selecciona el modelo deseado (ej. `gemini-2.5-flash`).
4. Haz clic en **Guardar Clave**. La clave permanecerá guardada de forma privada en el `localStorage` de tu navegador.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
