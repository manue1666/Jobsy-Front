# Jobsy

Jobsy es una aplicación móvil multiplataforma (Android e iOS) construida con React Native y Expo, que conecta profesionales con oportunidades de empleo de forma ágil y moderna para tareas casuales que no todo el mundo puede hacer, pero al menos alguien tendrá la experiencia para hacerlo!

---

## 📦 Características

- **Dark Mode:** Interfaz adaptable a modo oscuro o claro según configuración del sistema.
- **Navegación:** Uso de Expo Router para rutas anidadas y pestañas con iconos dinámicos.
- **Estilos:** TailwindCSS en React Native gracias a NativeWind.

---

## ⚙️ Requisitos previos

- Node.js ≥ 18
- npm o Yarn
- Expo CLI (`npm install -g expo-cli`)
- Java Development Kit (JDK) 11 o 17 (para compilación Android)
- EAS CLI (`npm install -g eas-cli`) para builds nativas

---

## 🚀 Instalación y ejecución

1. **Clona el repositorio:**
	```sh
	git clone https://github.com/tu-usuario/Jobsy.git
	cd Jobsy
	```

2. **Instala dependencias:**
	```sh
	npm install
	# o
	yarn install
	```

3. **Conecta al backend de la aplicación:**

	Para realizar la conexión a la base de datos, tienes que hacer uso de lo siguiente:
	- Clonar el [Repositorio del Backend](https://github.com/manue1666/jobsy_api) y ejecutarlo.
	- Abrir VSCode y, en el apartado de PORTS (se encuentra normalmente al lado de la pestaña de terminal), abrir el puerto 4000.
	- Cambiar la visibilidad de ese puerto a Publico.
	- Copiar la URL del puerto (deberia terminar en ...devtunnels.ms/) y ponerla en tu .env de esta manera:
	```
	EXPO_PUBLIC_BASE_URL=https://xxxxxxxx-4000.xxxx.devtunnels.ms/
	```

4. **Crea los archivos de configuración para expo-env:**

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

## 📲 Scripts disponibles

| Comando                        | Descripción                           |
| ------------------------------ | ------------------------------------- |
| `npx expo start`    | Inicia Metro Bundler |
| `npx run android` / `npx expo run:android` | Compila y lanza en emulador Android |
| `npx run ios` / `npx expo run:ios` | Compila y lanza en simulador iOS |
| `eas build --platform android --local` | Genera APK/Bundle Android (usa --local para no usar builds EAS) |
| `eas build --platform ios --local`     | Genera IPA iOS |
---

## 📐 Estructura del proyecto

```
Jobsy/
├── app/                # Rutas y pantallas con Expo Router
│   ├── (auth)/         # Login y registro
│   ├── (tabs)/         # Navegación principal
│   ├── _layout.tsx     # Layout raíz
│   └── _layout...tsx   # Layouts anidados
├── assets/             # Imágenes, fuentes y recursos estáticos
├── components/         # Componentes reutilizables
├── helpers/            # Lógica de negocio, cliente API, hooks
├── global.css          # TailwindCSS para web (solo web)
├── tailwind.config.js  # Configuración de NativeWind
├── babel.config.js     # Plugin nativewind/babel
├── metro.config.js     # Configuración Metro + NativeWind
├── development.config.js # Lectura de variables .env para development
├── production.config.js # Lecutra de variables .env para producción
├── .env                # Variables de entorno (ignorado, se tendrá que crear por tu cuenta)
├── .request.ts         # Logica para conexión a API.
├── eas.json            # Perfiles de compilación EAS
└── README.md           # Documentación del proyecto
```

---

## TODOs:

- ~~**Autenticación:** Pantallas de registro e inicio de sesión con almacenamiento seguro de tokens (JWT).~~ [43486d8](https://github.com/MaruDeHabanero/Jobsy-Front/commit/43486d830169db376a3ee72b62b30cffa83d1d6a)
- **Comunicación con API:** Cliente axios configurado para llamadas REST a un backend Express.
- **Gestión de estado:** Hooks de React para formularios y estado de autenticación.
- **Busqueda Geolocalizada**: Se utilizaran datos geolocalizados para buscar profesionales al alcance del usuario.

---
