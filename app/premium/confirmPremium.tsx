import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemeContext } from "@/context/themeContext";
import { premiumUserService } from "@/helpers/premium_user";
import { useSafeStripe } from "@/hooks/useSafeStripe";

function ConfirmPremiumScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const {
    initPaymentSheet,
    presentPaymentSheet,
    isAvailable,
    isLoading: stripeLoading,
  } = useSafeStripe();

  const planId = "monthly";
  const price = 99;
  const planLabel = "Plan mensual Premium";

  const initializePaymentSheet = async () => {
    try {
      const response = await premiumUserService(planId);
      // Solo valida que exista clientSecret
      if (!response.clientSecret) {
        throw new Error(
          response.message || "No se pudo iniciar el pago premium"
        );
      }
      setClientSecret(response.clientSecret);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: response.clientSecret,
        merchantDisplayName: "Jobsy Marketplace",
        returnURL: "jobsy://stripe-redirect",
        style: isDark ? "alwaysDark" : "alwaysLight",
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: "Cliente Jobsy",
        },
      });

      if (error) {
        throw new Error(`Error al configurar pago: ${error.message}`);
      }
      return true;
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Ocurrió un error al inicializar el pago"
      );
      return false;
    }
  };

  const handlePayment = async () => {
    if (!isAvailable) {
      Alert.alert("Error", "Sistema de pagos no disponible en este momento");
      return;
    }
    setIsLoading(true);
    setPaymentStatus("processing");
    try {
      const initialized = await initializePaymentSheet();
      if (!initialized) {
        setIsLoading(false);
        return;
      }
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== "Canceled") {
          throw new Error(
            error.message || "Ocurrió un error al procesar el pago"
          );
        } else {
          setPaymentStatus("idle");
          Alert.alert("Pago cancelado", "El proceso de pago fue cancelado.");
        }
      } else {
        setPaymentStatus("success");
        Alert.alert(
          "¡Éxito!",
          "¡Ahora eres usuario Premium! Disfruta de todos los beneficios.",
          [{ text: "Aceptar", onPress: () => router.replace("/(tabs)/perfil") }]
        );
      }
    } catch (error: any) {
      setPaymentStatus("error");
      Alert.alert(
        "Error",
        error.message || "Ocurrió un error al procesar el pago"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (stripeLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? "#FFD700" : "#FFD700"}
          />
          <Text
            className={`text-center mt-4 ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
          >
            Inicializando sistema de pagos...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!isAvailable) {
    return (
      <ScreenContainer>
        <View className="p-6 flex-1 justify-center">
          <Text className="text-lg text-center text-red-600 mb-4">
            ⚠️ Sistema de pagos temporalmente no disponible
          </Text>
          <Text
            className={`text-center ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
          >
            Estamos teniendo problemas técnicos con nuestro procesador de pagos.
            Por favor intenta más tarde.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 py-3 px-6 bg-yellow-400 rounded-lg"
          >
            <Text className="text-white text-center font-bold">Volver</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: "Confirmar Premium",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#fffbe6" },
          headerTintColor: "#FFD700",
        }}
      />
      <View
        className={`flex-1 px-6 py-8 ${isDark ? "bg-[#111823]" : "bg-yellow-50"}`}
      >
        <Text
          className={`text-2xl font-bold mb-6 text-center ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
        >
          Confirmar suscripción Premium
        </Text>

        {/* Información del plan */}
        <View
          className={`p-4 rounded-lg mb-6 ${isDark ? "bg-yellow-900" : "bg-yellow-100"} border border-yellow-300`}
        >
          <Text
            className={`text-lg font-semibold mb-2 ${isDark ? "text-yellow-100" : "text-yellow-800"}`}
          >
            Resumen del plan
          </Text>
          <Text
            className={`mb-2 ${isDark ? "text-yellow-100" : "text-yellow-900"}`}
          >
            ⭐ {planLabel}
          </Text>
          <Text
            className={`mb-2 text-xl font-bold ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
          >
            💰 Precio: ${price.toFixed(2)} MXN / mes
          </Text>
          <Text
            className={`text-sm mt-2 ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
          >
            Disfruta de todos los beneficios premium: publica hasta 5 servicios,
            sube hasta 9 imágenes por servicio y edita tus servicios publicados.
          </Text>
        </View>

        {/* Botón de pago */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isLoading}
          className={`py-4 px-6 rounded-lg mb-4 ${
            isLoading ? "bg-yellow-300" : "bg-yellow-400"
          }`}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator color="#fff" />
              <Text className="text-white ml-2 font-bold text-lg">
                Procesando...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              💳 Pagar ${price.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Estado del pago */}
        {paymentStatus === "success" && (
          <View className="bg-green-100 p-3 rounded-lg mb-4">
            <Text className="text-green-800 text-center">
              ✅ Pago completado exitosamente. ¡Bienvenido a Premium!
            </Text>
          </View>
        )}

        {paymentStatus === "error" && (
          <View className="bg-red-100 p-3 rounded-lg mb-4">
            <Text className="text-red-800 text-center">
              ❌ Error en el pago. Por favor intenta nuevamente.
            </Text>
          </View>
        )}

        {/* Información de seguridad */}
        <View
          className={`p-3 rounded-lg mt-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
        >
          <Text
            className={`text-xs text-center ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
          >
            🔒 Tu pago es seguro y procesado por Stripe. No almacenamos datos de
            tu tarjeta.
          </Text>
        </View>

        {/* Botón de cancelar */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading}
          className="mt-4 py-3 px-6 border border-yellow-300 rounded-lg"
        >
          <Text
            className={`text-center ${isDark ? "text-yellow-200" : "text-yellow-800"}`}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

export default ConfirmPremiumScreen;
