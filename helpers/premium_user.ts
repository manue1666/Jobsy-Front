import api from "@/request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PremiumUserResponse {
  clientSecret: string | null;
  subscriptionId?: string;
  status?: string;
  requiresPaymentMethod?: boolean;
  setupIntentUrl?: string;
  error?: string;
  message?: string;
  alreadyPremium?: boolean;
  currentPeriodEnd?: string; 
  trialEnd?: string;
}

export interface PremiumUserError {
  status: number;
  requiresPaymentMethod?: boolean;
  setupIntentUrl?: string;
  message?: string;
  error?: string;
}

export async function premiumUserService(): Promise<PremiumUserResponse> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No se encontró el token de autenticación");

    const response = await api.post(
      "/user/premium",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("Respuesta inválida del servidor");
    }
  } catch (error: any) {
    console.error("Error en premiumUserService:", error?.response?.status, error?.message);

    // Manejar error 402 - Requiere método de pago
    if (error?.response?.status === 402) {
      const errorData = error.response.data;
      const premiumError: PremiumUserError = {
        status: 402,
        requiresPaymentMethod: errorData.requiresPaymentMethod,
        setupIntentUrl: errorData.setupIntentUrl,
        message: errorData.message || "Se requiere un método de pago",
        error: errorData.error,
      };
      throw premiumError;
    }

    if (error?.response?.status === 401) {
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente");
    } else if (error?.response?.status === 403) {
      throw new Error("No tienes permiso para realizar esta acción");
    } else if (error?.response?.status === 404) {
      throw new Error("Usuario no encontrado");
    } else if (error?.response?.status === 500) {
      throw new Error(error?.response?.data?.details || "Error del servidor");
    }

    throw error;
  }
}

export async function createPremiumSetupIntentService(): Promise<{
  setupIntentClientSecret: string;
}> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No se encontró el token de autenticación");

    const response = await api.post(
      "/user/premium/setup-intent",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 && response.data) {
      console.log("SetupIntent obtenido exitosamente");
      return response.data;
    } else {
      throw new Error("No se pudo obtener el SetupIntent");
    }
  } catch (error: any) {
    console.error("Error en createPremiumSetupIntentService:", error?.response?.status, error?.message);
    throw error;
  }
}
