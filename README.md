# AppMovilesProyectoGrupo8

## Descripción
AppMovilProyecto es una aplicación móvil desarrollada con React Native y Expo, que incorpora funcionalidades avanzadas como mapas interactivos, almacenamiento asíncrono y gestión de autenticación.

## Tecnologías Utilizadas

- **Framework:** React Native (Expo)
- **Lenguaje:** TypeScript
- **Base de Datos:** Prisma (conectado a un backend)
- **UI:** React Native Elements, React Native Paper
- **Gestión de Estado y Utilidades:** Axios, Async Storage, React Native Gesture Handler
- **Mapas:** React Native Maps
- **Animaciones:** Lottie React Native
- **Testing:** Jest con Jest-Expo

## Instalación y Configuración

Para ejecutar el proyecto en tu máquina local, sigue estos pasos:

### Prerrequisitos
Asegúrate de tener instalado:
- **Node.js** (versión recomendada: 18 o superior)
- **Expo CLI**
- **Android Studio/Xcode** (según el sistema operativo y el dispositivo de prueba)

### Instalación
1. Clona el repositorio:
   ```
   git clone https://github.com/tu-usuario/appmovilproyecto.git
   cd appmovilproyecto
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

### Ejecución
- Para iniciar el proyecto en modo desarrollo:
  ```bash
  npm start
  ```
- Para ejecutarlo en un emulador Android:
  ```bash
  npm run android
  ```
- Para ejecutarlo en iOS (requiere Mac y Xcode):
  ```bash
  npm run ios
  ```
- Para ejecutarlo en la web:
  ```bash
  npm run web
  ```

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo de Expo.
- `npm run android`: Compila y ejecuta la app en un dispositivo/emulador Android.
- `npm run ios`: Compila y ejecuta la app en un dispositivo/emulador iOS.
- `npm run web`: Inicia la versión web de la app.
- `npm run test`: Ejecuta las pruebas con Jest.
- `npm run lint`: Analiza el código con ESLint.
- `npm run reset-project`: Restaura el proyecto a su estado original.

## Estructura del Proyecto
```
appmovilproyecto/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── screens/        # Pantallas principales
│   ├── services/       # Lógica de negocio y llamadas API
│   ├── hooks/          # Hooks personalizados
│   ├── context/        # Gestión del contexto global
│   ├── assets/         # Recursos gráficos
│   ├── styles/         # Estilos globales
│   └── index.js        # Punto de entrada principal
├── scripts/            # Scripts útiles
├── package.json        # Dependencias y configuración del proyecto
└── README.md           # Documentación del proyecto
```



## Contacto
Para dudas o sugerencias, contáctame en [tu-email@example.com] o abre un issue en el repositorio.

