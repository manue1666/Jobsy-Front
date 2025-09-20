import api from "@/request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CancelPremiumResponse {
  success: boolean;
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
}

export async function cancelPremiumSubscription(cancelAtPeriodEnd: boolean = false): Promise<CancelPremiumResponse> {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No se encontró el token de autenticación");
  try {
    const response = await api.post(
      "/user/premium/cancel",
      { cancelAtPeriodEnd },
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
      throw new Error("No se pudo cancelar la suscripción premium");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Error al cancelar la suscripción premium");
  }
}

export interface PremiumStatusResponse {
  isPremium: boolean;
  premiumUntil: string | null;
  stripeCustomerId: string | null;
  subscription?: {
    id: string;
    status: string;
    priceId: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    defaultPaymentMethod?: any;
  };
  invoices?: Array<{
    id: string;
    status: string;
    amountPaid: number;
    amountDue: number;
    currency: string;
    created: string;
    hostedInvoiceUrl: string;
    periodEnd: string | null;
    subscription: string | null;
  }>;
}

export async function getPremiumStatus(): Promise<PremiumStatusResponse> {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No se encontró el token de autenticación");
  try {
    const response = await api.get("/user/premium/status", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error("No se pudo obtener el estado premium");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Error al obtener el estado premium");
  }
}


