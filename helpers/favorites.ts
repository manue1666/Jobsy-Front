import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Obtener favoritos del usuario
export async function getFavorites(service_id: string) {
   try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Llamada a la API usando get
    const response = await api.get('/fav/get/', {
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
      console.error('Error en getFavoriteServices:', error.message);
      
      // Relanzamos el error para que el componente que llama pueda manejarlo
      throw error;
    } else {
      // Para errores que no son instancias de Error
      console.error('Error desconocido en getFavoriteServices:', error);
      throw new Error('Ocurrió un error desconocido al obtener los favoritos');
    }
  }
}

//Agregar Favorito
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

//Remover Favorito
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