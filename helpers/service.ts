import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createService(
  service_name: string,
  category: string,
  description: string,
  phone: string,
  email: string,
  address: string,
  photos: string[], 
  tipo: string[] 
): Promise<void> {
  try {
    // Validación de campos
    if (!service_name || !description || !email || !category || !phone || !address) {
      throw new Error('Datos mínimos incompletos');
    }

    // Validar que photos y tipo sean arrays
    if (!Array.isArray(photos) || !Array.isArray(tipo)) {
      throw new Error('Las fotos y el tipo deben ser arrays');
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Preparar el cuerpo de la petición según la estructura esperada
    const requestBody = {
      service_name,
      category,
      description,
      phone,
      email,
      address,
      photos,
      tipo
    };

    // Llamada a la API usando POST
    const response = await api.post('/service/post', requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // si la respuesta indica éxito
    if (response.status = 200) {
      return response.data
    }

    // Si todo sale bien, no necesitamos retornar nada (void)
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      console.error('Error en createService:', error.message);
      
      // Relanzamos el error para que el componente que llama pueda manejarlo
      throw error;
    } else {
      // Para errores que no son instancias de Error
      console.error('Error desconocido en createService:', error);
      throw new Error('Ocurrió un error desconocido al crear el servicio');
    }
  }
}

export async function addFavorite(service_id: string) {
   try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Llamada a la API usando POST
    const response = await api.post(`/fav/post/${service_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // si la respuesta indica éxito
    if (response.status === 200 || response.status === 201) {
      return response.data
    }

    // Si todo sale bien, no necesitamos retornar nada (void)
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      console.error('Error en addFavoriteService:', error.message);
      
      // Relanzamos el error para que el componente que llama pueda manejarlo
      throw error;
    } else {
      // Para errores que no son instancias de Error
      console.error('Error desconocido en addFavoriteService:', error);
      throw new Error('Ocurrió un error desconocido al marcar como favorito');
    }
  }
}

export async function removeFavorite(service_id: string) {
   try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Llamada a la API usando POST
    const response = await api.delete(`/fav/delete/${service_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // si la respuesta indica éxito
    if (response.status === 200 || response.status === 201) {
      return response.data
    }

    // Si todo sale bien, no necesitamos retornar nada (void)
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      console.error('Error en addFavoriteService:', error.message);
      
      // Relanzamos el error para que el componente que llama pueda manejarlo
      throw error;
    } else {
      // Para errores que no son instancias de Error
      console.error('Error desconocido en addFavoriteService:', error);
      throw new Error('Ocurrió un error desconocido al marcar como favorito');
    }
  }
}