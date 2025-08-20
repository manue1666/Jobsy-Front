
import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BoostResponse {
  clientSecret: string;
  amount?: number;
  currency?: string;
}

export async function boostService(service_id: string, planId: string): Promise<BoostResponse> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Llamada a la API usando POST con el planId en el body
    const response = await api.post(
      `/service/boost/${service_id}`,
      { planId }, // Body con el plan seleccionado
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Verificar que la respuesta tenga el clientSecret
    if (response.status === 200 && response.data.clientSecret) {
      return response.data;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }

  } catch (error) {
    // Manejo de errores específico para boost
    if (error instanceof Error) {
      console.error('Error en boostService:', error.message);
      
      // Mensajes más específicos según el tipo de error
      if (error.message.includes('network')) {
        throw new Error('Error de conexión. Verifica tu internet');
      } else if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor inicia sesión again');
      } else if (error.message.includes('403')) {
        throw new Error('No tienes permiso para boostear este servicio');
      } else if (error.message.includes('404')) {
        throw new Error('Servicio no encontrado');
      }
      
      throw error;
    } else {
      console.error('Error desconocido en boostService:', error);
      throw new Error('Ocurrió un error desconocido al procesar el pago');
    }
  }
}