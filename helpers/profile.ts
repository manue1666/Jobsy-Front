import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) throw new Error('No token found');

    //llamada a la api
    const response = await api.get('/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;

  } catch (error: any) {
    const message = error.response?.data?.error || 'Error al obtener perfil';
    throw new Error(message);
  }
};

export const deleteUserProfile = async (userId: string) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No token found');

    //llamada a la api
    const response = await api.delete('/user/delete/${userId}', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;

  } catch (error: any) {
    const message = error.response?.data?.error || 'Error al eliminar perfil';
    throw new Error(message);
  }
};