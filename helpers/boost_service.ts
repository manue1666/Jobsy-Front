import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BoostResponse {
  clientSecret: string;
  amount: number;
  paymentIntentId: string;
  status: string;
  plan?: {
    id: string;
    label: string;
    duration: number;
    amount: number;
  };
  service?: {
    id: string;
    name: string;
  };
  message?: string;
  // Campos para cuando ya está promocionado
  error?: string;
  promotedUntil?: string;
  currentPlan?: string;
  remainingHours?: number;
  remainingMinutes?: number;
}

export interface BoostError {
  status: number;
  error?: string;
  message?: string;
  promotedUntil?: string;
  currentPlan?: string;
  remainingHours?: number;
  remainingMinutes?: number;
  availablePlans?: string[];
}

export interface BoostStatusResponse {
  serviceId: string;
  serviceName: string;
  isPromoted: boolean;
  promotedUntil?: string;
  promotionPlan?: string;
  lastPromotedAt?: string;
  remainingTime?: {
    hours: number;
    minutes: number;
    total_milliseconds: number;
  };
  paymentHistory?: Array<{
    amount: number;
    status: string;
    plan?: string;
    createdAt: string;
    completedAt?: string;
  }>;
}

export async function boostService(service_id: string, planId: string): Promise<BoostResponse> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    console.log('[BoostService] Solicitando boost - Service:', service_id, 'Plan:', planId);

    const response = await api.post(
      `/service/boost/${service_id}`,
      { planId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 && response.data) {
      console.log('[BoostService] ✅ Respuesta exitosa:', response.data.paymentIntentId);
      return response.data;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }

  } catch (error: any) {
    console.error('[BoostService] Error:', error?.response?.status, error?.message);

    // Manejar error 409 - Ya está promocionado
    if (error?.response?.status === 409) {
      const errorData = error.response.data;
      const boostError: BoostError = {
        status: 409,
        error: errorData.error || 'already_promoted',
        message: errorData.message || 'Este servicio ya está en promoción',
        promotedUntil: errorData.promotedUntil,
        currentPlan: errorData.currentPlan,
        remainingHours: errorData.remainingHours,
        remainingMinutes: errorData.remainingMinutes,
      };
      throw boostError;
    }

    // Manejar error 400 - Servicio inactivo o datos inválidos
    if (error?.response?.status === 400) {
      const errorData = error.response.data;
      throw new Error(errorData.message || 'Datos inválidos. Verifica el servicio y plan.');
    }

    // Manejar error 401 - No autenticado
    if (error?.response?.status === 401) {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente');
    }

    // Manejar error 403 - No autorizado
    if (error?.response?.status === 403) {
      throw new Error('No tienes permiso para promocionar este servicio');
    }

    // Manejar error 404 - Servicio no encontrado
    if (error?.response?.status === 404) {
      throw new Error('Servicio no encontrado');
    }

    // Manejar error 500 - Error del servidor
    if (error?.response?.status === 500) {
      throw new Error(error?.response?.data?.details || 'Error del servidor al procesar boost');
    }

    throw error;
  }
}

// Nuevo servicio para obtener estado de boost
export async function getBoostStatus(service_id: string): Promise<BoostStatusResponse> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    console.log('[BoostStatus] Consultando estado - Service:', service_id);

    const response = await api.get(
      `/service/boost/${service_id}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 && response.data) {
      console.log('[BoostStatus] ✅ Estado obtenido:', {
        isPromoted: response.data.isPromoted,
        remainingHours: response.data.remainingTime?.hours,
      });
      return response.data;
    } else {
      throw new Error('Respuesta inválida del servidor');
    }

  } catch (error: any) {
    console.error('[BoostStatus] Error:', error?.response?.status, error?.message);
    throw error;
  }
}