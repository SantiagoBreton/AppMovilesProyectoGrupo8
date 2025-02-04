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
 📦 Dependencias principales
   ```bash
   npm install @expo/vector-icons
   npm install @prisma/client
   npm install @react-native-async-storage/async-storage
   npm install @react-native-community/datetimepicker
   npm install @types/react-native-dotenv
   npm install axios
   npm install expo
   npm install expo-constants
   npm install expo-file-system
   npm install expo-font
   npm install expo-image-picker
   npm install expo-linking
   npm install expo-location
   npm install expo-router
   npm install expo-splash-screen
   npm install expo-status-bar
   npm install expo-system-ui
   npm install expo-web-browser
   npm install lottie-react-native
   npm install react
   npm install react-dom
   npm install react-native
   npm install react-native-dotenv
   npm install react-native-elements
   npm install react-native-gesture-handler
   npm install react-native-image-picker
   npm install react-native-linear-gradient
   npm install react-native-maps
   npm install react-native-paper
   npm install react-native-reanimated
   npm install react-native-safe-area-context
   npm install react-native-screens
   npm install react-native-svg
   npm install react-native-web
   ```

   🛠 Dependencias de desarrollo
   ```bash
   npm install --save-dev @babel/core
   npm install --save-dev @types/jest
   npm install --save-dev @types/lodash
   npm install --save-dev @types/react
   npm install --save-dev @types/react-native-maps
   npm install --save-dev @types/react-test-renderer
   npm install --save-dev jest
   npm install --save-dev jest-expo
   npm install --save-dev prisma
   npm install --save-dev react-test-renderer
   npm install --save-dev typescript
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

3. Configuración de Variables de Entorno
   Crea un archivo .env en la raíz del proyecto y agrega las siguientes variables:
   ```bash
   

   EXPO_PUBLIC_SERVER_IP = Tu ip

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

