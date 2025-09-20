import api from "@/request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PremiumUserResponse {
  clientSecret: string | null;
  subscriptionId?: string;
  status?: string;
  requiresPaymentMethod?: boolean;
  message?: string;
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
    console.error("Error en premiumUserService:", error?.message);

    if (error?.message?.includes("network")) {
      throw new Error("Error de conexión. Verifica tu internet");
    } else if (error?.message?.includes("401")) {
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente");
    } else if (error?.message?.includes("403")) {
      throw new Error("No tienes permiso para realizar esta acción");
    } else if (error?.message?.includes("404")) {
      throw new Error("Usuario no encontrado");
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
      return response.data;
    } else {
      throw new Error("No se pudo obtener el SetupIntent");
    }
  } catch (error: any) {
    console.error("Error en createPremiumSetupIntentService:", error?.message);
    throw error;
  }
}
