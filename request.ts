import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración base de Axios
//CAMBIAR URL
const api = axios.create({
  baseURL: "https://0qdcgl00-4000.usw3.devtunnels.ms/",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para añadir el token a las peticiones (si existe)
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error al obtener el token:', error);
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejo de errores 401 (No autorizado)
    if (error.response?.status === 401) {
      try {
        // Opcional: Intentar refrescar el token aquí si tu backend lo soporta
        console.log('Token expirado o no válido - Redirigiendo a login');
        
        // Limpiar el token almacenado
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        
        // Redirigir a pantalla de login
        // Nota: Necesitarás inyectar el router o manejar la navegación de otra forma
      } catch (e) {
        console.error('Error al manejar token expirado:', e);
      }
    }
    
    // Manejo de otros errores comunes
    if (!error.response) {
      console.error('Error de conexión:', error.message);
      throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

export default api;