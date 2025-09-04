import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtener comentarios de un servicio
export async function getCommentsByService(service_id: string) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    const response = await api.get(`/comments/${service_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en getCommentsByService:', error.message);
      throw error;
    } else {
      console.error('Error desconocido en getCommentsByService:', error);
      throw new Error('Ocurrió un error desconocido al obtener los comentarios');
    }
  }
}

// Agregar comentario a un servicio
export async function addComment(service_id: string, comment: string) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    const response = await api.post(
      `/comment/post/${service_id}`,
      { comment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en addComment:', error.message);
      throw error;
    } else {
      console.error('Error desconocido en addComment:', error);
      throw new Error('Ocurrió un error desconocido al agregar el comentario');
    }
  }
}

// Eliminar comentario por id
export async function deleteComment(comment_id: string) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    const response = await api.delete(`/comment/delete/${comment_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en deleteComment:', error.message);
      throw error;
    } else {
      console.error('Error desconocido en deleteComment:', error);
      throw new Error('Ocurrió un error desconocido al eliminar el comentario');
    }
  }
}
