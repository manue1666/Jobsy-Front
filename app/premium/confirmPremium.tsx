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
import {
  premiumUserService,
  createPremiumSetupIntentService,
} from "@/helpers/premium_user";
import { useSafeStripe } from "@/hooks/useSafeStripe";
import { sendEmail } from "@/helpers/email";
import { useAlert } from "@/components/mainComponents/Alerts";
import { getUserProfile } from "@/helpers/profile";

function ConfirmPremiumScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string>("");
  const { okAlert, errAlert } = useAlert();

  const {
    initPaymentSheet,
    presentPaymentSheet,
    isAvailable,
    isLoading: stripeLoading,
  } = useSafeStripe();

  const price = 99;
  const planLabel = "Plan mensual Premium";

  type InitResult =
    | { ok: true; mode: "payment" }
    | { ok: true; mode: "poll" }
    | { ok: false; message?: string };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const initializePaymentSheet = async (): Promise<InitResult> => {
    try {
      let response = await premiumUserService();
      if (response.requiresPaymentMethod) {
        setInfoMessage(
          "Necesitas asociar una tarjeta antes de suscribirte. Se abrirá el formulario de Stripe para agregar tu método de pago."
        );
        // Solicitar SetupIntent para asociar tarjeta
        const setupIntentRes = await createPremiumSetupIntentService();
        const { error: setupError } = await initPaymentSheet({
          setupIntentClientSecret: setupIntentRes.setupIntentClientSecret,
          merchantDisplayName: "Jobsy Marketplace",
          returnURL: "jobsy://stripe-redirect",
          style: isDark ? "alwaysDark" : "alwaysLight",
          defaultBillingDetails: {
            name: "Cliente Jobsy",
          },
        });
        if (setupError) throw new Error(setupError.message);
        const setupResult = await presentPaymentSheet();
        if (setupResult.error) throw new Error(setupResult.error.message);
        setInfoMessage("");
        // Volver a llamar a /user/premium para crear la suscripción y obtener el clientSecret del PaymentIntent
        response = await premiumUserService();
      }
      // Pequeño delay para dar tiempo a la creación del PaymentIntent o activación vía webhook
      await delay(2000);

      // Si el backend decidió forzar el pago off-session, no habrá clientSecret: debemos hacer polling del perfil
      if (response.clientSecret === null) {
        setClientSecret(null);
        setInfoMessage(
          "Estamos procesando tu suscripción. Esto puede tardar unos segundos..."
        );
        return { ok: true, mode: "poll" };
      }

      // Si tenemos clientSecret, configuramos el PaymentSheet para confirmar el pago
      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
        setInfoMessage(
          "Confirma el pago de tu suscripción en el siguiente paso. Tras el pago, tu cuenta será activada como premium en unos segundos."
        );
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
        return { ok: true, mode: "payment" };
      }

      // Cualquier otro caso inesperado: pasamos a polling como fallback
      setInfoMessage("Estamos verificando el estado de tu suscripción...");
      return { ok: true, mode: "poll" };
    } catch (error: any) {
      setInfoMessage("");
      errAlert(
        "Error",
        error.message || "No se pudo iniciar el proceso de pago"
      );
      return { ok: false, message: error.message };
    }
  };

  const handlePayment = async () => {
    if (!isAvailable) {
      errAlert("Error", "Sistema de pagos no disponible en este momento");
      return;
    }
    setIsLoading(true);
    setPaymentStatus("processing");
    try {
      const init = await initializePaymentSheet();
      if (!init.ok) {
        setIsLoading(false);
        return;
      }

      if (init.mode === "poll") {
        // Polling del estado premium hasta 20s (aprox 12 intentos cada 1.5s)
        setInfoMessage("Procesando pago y activación de tu suscripción...");
        const maxAttempts = 12;
        let activated = false;
        for (let i = 0; i < maxAttempts; i++) {
          await delay(1500);
          try {
            const profile = await getUserProfile();
            if (profile?.isPremium) {
              activated = true;
              break;
            }
          } catch {
            // Ignorar errores transitorios de red durante el polling
          }
        }

        if (activated) {
          setPaymentStatus("success");
          setInfoMessage("");
          Alert.alert(
            "¡Éxito!",
            "¡Ahora eres usuario Premium! Disfruta de todos los beneficios.",
            [
              {
                text: "Aceptar",
                onPress: () => router.replace("/(tabs)/perfil"),
              },
            ]
          );
          try {
            await sendEmail();
            okAlert(
              "CORREO ENVIADO",
              "Revisa tu correo para más información sobre tu suscripción Premium"
            );
          } catch {
            errAlert("CORREO NO ENVIADO", "OCURRIO UN ERROR");
          }
        } else {
          setPaymentStatus("idle");
          errAlert(
            "Seguimos procesando",
            "Tu pago está en proceso. Si no ves la activación en unos minutos, intenta actualizar tu perfil."
          );
          try {
            await sendEmail();
            okAlert(
              "CORREO ENVIADO",
              "Revisa tu correo para más información sobre tu suscripción Premium"
            );
          } catch {
            errAlert("CORREO NO ENVIADO", "OCURRIO UN ERROR");
          }
        }
        return;
      }

      // Modo pago interactivo con PaymentSheet
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== "Canceled") {
          throw new Error(
            error.message || "Ocurrió un error al procesar el pago"
          );
        } else {
          setPaymentStatus("idle");
          errAlert("Pago cancelado", "Has cancelado el proceso de pago");
        }
      } else {
        setPaymentStatus("success");
        Alert.alert(
          "¡Éxito!",
          "¡Ahora eres usuario Premium! Disfruta de todos los beneficios.",
          [{ text: "Aceptar", onPress: () => router.replace("/(tabs)/perfil") }]
        );
        try {
          await sendEmail();
          okAlert(
            "CORREO ENVIADO",
            "Revisa tu correo para más información sobre tu suscripción Premium"
          );
        } catch {
          errAlert("CORREO NO ENVIADO", "OCURRIO UN ERROR");
        }
      }
    } catch (error: any) {
      setPaymentStatus("error");
      errAlert(
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

        {/* Mensaje informativo del proceso */}
        {infoMessage && (
          <View className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg mb-4">
            <Text className="text-yellow-800 text-center text-sm">
              {infoMessage}
            </Text>
          </View>
        )}

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
