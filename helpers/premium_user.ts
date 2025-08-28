import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PremiumUserResponse {
  success: boolean;
  message?: string;
  clientSecret?: string; // Añadido para Stripe
}

export async function premiumUserService(planId: string): Promise<PremiumUserResponse> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    const response = await api.post(
      '/user/premium',
      { planId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en premiumUserService:', error.message);

      if (error.message.includes('network')) {
        throw new Error('Error de conexión. Verifica tu internet');
      } else if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente');
      } else if (error.message.includes('403')) {
        throw new Error('No tienes permiso para realizar esta acción');
      } else if (error.message.includes('404')) {
        throw new Error('Usuario o plan no encontrado');
      }

      throw error;
    } else {
      console.error('Error desconocido en premiumUserService:', error);
      throw new Error('Ocurrió un error desconocido al procesar la solicitud');
    }
  }
}
