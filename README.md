# Jobsy Frontend

Aplicación móvil multiplataforma (Android e iOS) creada con **React Native** y **Expo** para conectar profesionales con oportunidades de empleo en tareas casuales y servicios. Desarrollada en TypeScript por el equipo de Ingeniería de Teteocan Technologies para el Intraemprendimiento Jobsy.

---

## 📦 Características principales

- **Dark Mode:** Interfaz adaptable según la configuración del sistema.
- **Navegación:** Expo Router para rutas anidadas y pestañas con iconos dinámicos.
- **Estilos:** TailwindCSS en React Native vía NativeWind.
- **Autenticación:** Registro e inicio de sesión con almacenamiento seguro de JWT.
- **Gestión de servicios:** Publica, edita y elimina servicios.
- **Búsqueda geolocalizada:** Encuentra profesionales cerca de la ubicación del usuario.
- **Favoritos:** Guarda servicios y profesionales preferidos.
- **Comentarios:** Sistema de comentarios para servicios.
- **Soporte a pagos:** Integración con Stripe (suscripciones y promociones).
- **Notificaciones:** Integración para notificaciones push (pendiente/futuro).

---

## ⚙️ Requisitos previos

- Node.js ≥ 18
- npm o Yarn
- Expo CLI (`npm install -g expo-cli`)
- Java Development Kit (JDK) 11 o 17 (para Android)
- EAS CLI (`npm install -g eas-cli`) para builds nativas

---

## 🚀 Instalación y ejecución

1. **Clona el repositorio:**
    ```sh
    git clone https://github.com/manue1666/Jobsy-Front.git
    cd Jobsy-Front
    ```

2. **Instala dependencias:**
    ```sh
    npm install
    # o
    yarn install
    ```

3. **Conecta al backend:**
    - Clona y ejecuta el [backend Jobsy API](https://github.com/manue1666/jobsy_api).
    - Abre el puerto 4000 y configúralo como público en tu entorno de desarrollo.
    - Copia la URL pública del puerto y agrégala a tu archivo `.env`:
      ```
      EXPO_PUBLIC_BASE_URL=https://xxxxxxxx-4000.xxxx.devtunnels.ms/
      ```

4. **Configura archivos para expo-env:**
    - `development.config.js`:
      ```js
      require('dotenv').config();
      module.exports = { API_BASE_URL: process.env.API_BASE_URL };
      ```
    - `production.config.js`:
      ```js
      require('dotenv').config({ path: '.env.production' });
      module.exports = { API_BASE_URL: process.env.API_BASE_URL };
      ```

5. **Inicia Metro Bundler:**
    ```sh
    npx expo start
    ```

---

## 📐 Estructura del proyecto

```
Jobsy-Front/
├── app/                # Rutas y pantallas con Expo Router
│   ├── (auth)/         # Login y registro
│   ├── (tabs)/         # Navegación principal
│   ├── _layout.tsx     # Layout raíz
│   └── ...             # Otros layouts y pantallas
├── assets/             # Imágenes, fuentes y recursos
├── components/         # Componentes reutilizables
├── helpers/            # Lógica de negocio, hooks, cliente API
├── global.css          # TailwindCSS para web
├── tailwind.config.js  # Configuración NativeWind
├── babel.config.js     # Configuración de Babel
├── metro.config.js     # Configuración de Metro
├── development.config.js # Variables entorno dev
├── production.config.js  # Variables entorno prod
├── .env                # Variables de entorno (privado)
├── .request.ts         # Lógica para conexión a API
├── eas.json            # Perfiles de compilación EAS
└── README.md           # Documentación
```

---

## 📲 Scripts disponibles

| Comando                                     | Descripción                           |
| -------------------------------------------- | ------------------------------------- |
| `npx expo start`                             | Inicia Metro Bundler                  |
| `npx expo run:android` / `npx run android`   | Compila y lanza en emulador Android   |
| `npx expo run:ios` / `npx run ios`           | Compila y lanza en simulador iOS      |
| `eas build --platform android --local`       | Genera APK/Bundle Android             |
| `eas build --platform ios --local`           | Genera IPA iOS                        |

---

## 🔌 Comunicación con el backend

La app consume la API REST de [jobsy_api](https://github.com/manue1666/jobsy_api) para:

- Registro, login y perfil de usuarios
- CRUD de servicios
- Gestión de favoritos y comentarios
- Promociones y pagos (Stripe)
- Recuperación de contraseñas por email

---


---

## 📝 Licencia

Este proyecto es propiedad de Teteocan Technologies. Uso interno y para fines del intraemprendimiento Jobsy.
