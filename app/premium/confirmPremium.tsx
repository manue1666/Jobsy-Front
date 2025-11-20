import React, { useContext, useState, useRef, useEffect } from "react";
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

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
 
  const initializePaymentSheet = async (): Promise<InitResult> => {
    try {
      let response: any;

      try {
        response = await premiumUserService();
        
        if (response.alreadyPremium) {
          console.log("Usuario ya tiene suscripción premium activa");
          okAlert(
            "Ya eres Premium",
            `Ya cuentas con una suscripción premium activa${
              response.currentPeriodEnd 
                ? ` hasta ${new Date(response.currentPeriodEnd).toLocaleDateString()}`
                : ""
            }. No necesitas pagar de nuevo.`
          );
          
          // Redirigir después de mostrar el mensaje
          setTimeout(() => {
            router.back();
          }, 2000);
          
          return { ok: false, message: "Ya premium" };
        }
        
      } catch (error: any) {
        // Manejo especial para error 402 - Requiere método de pago
        if (error?.status === 402 || error?.requiresPaymentMethod) {
          console.log("Se requiere agregar método de pago primero");
          setInfoMessage(
            "Necesitas asociar una tarjeta antes de suscribirte. Se abrirá el formulario de Stripe para agregar tu método de pago."
          );

          try {
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

            if (setupError) {
              throw new Error(`Error al inicializar SetupIntent: ${setupError.message}`);
            }

            const setupResult = await presentPaymentSheet();
            if (setupResult.error) {
              if (setupResult.error.code === "Canceled") {
                throw new Error("Cancelaste el proceso de agregar método de pago");
              }
              throw new Error(`Error al agregar método de pago: ${setupResult.error.message}`);
            }

            setInfoMessage("");
            console.log("Método de pago agregado exitosamente. Esperando confirmación de webhooks...");
            
            // Esperar más tiempo para que los webhooks de Stripe procesen:
            // - setup_intent.succeeded
            // - payment_method.attached
            // - customer.updated (asignación de default payment method)
            // Típicamente toma 2-3 segundos, pero esperamos más para estar seguros
            await delay(3000);

            console.log("Reintentando crear suscripción premium...");

            // Volver a llamar a /user/premium para crear la suscripción
            try {
              response = await premiumUserService();
              console.log("Suscripción creada exitosamente en reintento");
            } catch (retryError: any) {
              console.error("Error en reintento de suscripción:", retryError?.status, retryError?.message);
              if (retryError?.status === 402) {
                throw new Error("Aún hay problemas con tu método de pago. Por favor intenta de nuevo.");
              }
              throw retryError;
            }
          } catch (setupError: any) {
            setInfoMessage("");
            console.error("Error en flujo de SetupIntent:", setupError);
            throw setupError;
          }
        } else {
          // Re-lanzar otros errores
          console.error("Error no relacionado a método de pago:", error);
          throw error;
        }
      }

      // Pequeño delay para dar tiempo a la creación del PaymentIntent o activación vía webhook
      await delay(2000);

      // Si el backend decidió forzar el pago off-session (clientSecret === null)
      if (response.clientSecret === null) {
        setClientSecret(null);
        setInfoMessage(
          "Estamos procesando tu suscripción con tu método de pago guardado. Esto puede tardar unos segundos..."
        );
        console.log("Modo poll activado: pago off-session");
        return { ok: true, mode: "poll" };
      }

      // Si tenemos clientSecret, configuramos el PaymentSheet para confirmar el pago interactivamente
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
        console.log("Modo payment activado: requiere confirmación de usuario");
        return { ok: true, mode: "payment" };
      }

      // Cualquier otro caso inesperado: pasamos a polling como fallback
      setInfoMessage("Estamos verificando el estado de tu suscripción...");
      console.log("Modo poll activado como fallback");
      return { ok: true, mode: "poll" };
    } catch (error: any) {
      setInfoMessage("");
      console.error("Error en initializePaymentSheet:", error);
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

    if (!mountedRef.current) return;

    setIsLoading(true);
    setPaymentStatus("processing");

    try {
      const init = await initializePaymentSheet();
      
      if (!init.ok) {
        setIsLoading(false);
        return;
      }

      // Modo: Pago off-session (sin interacción del usuario)
      if (init.mode === "poll") {
        setPaymentStatus("processing");
        setInfoMessage(
          "Estamos activando tu suscripción con tu método de pago. Por favor espera..."
        );

        try {
          // Esperar a que los webhooks de Stripe procesen el pago:
          // - payment_intent.succeeded
          // - invoice.payment_succeeded
          // - Usuario se marca como premium en la BD
          // Típicamente toma 3-5 segundos, esperamos más para estar seguros
          console.log("Esperando confirmación de webhook de pago...");
          await delay(5000);

          const profile = await getUserProfile();
          
          if (!mountedRef.current) return;

          console.log("Perfil obtenido:", { isPremium: profile?.isPremium });

          if (profile?.isPremium) {
            setPaymentStatus("success");
            setInfoMessage("");
            console.log("✅ Usuario ahora es Premium");
            
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
            } catch (emailError) {
              console.error("Error al enviar correo:", emailError);
              // No mostrar alerta de error si el pago se procesó correctamente
            }
          } else {
            // El pago puede estar en proceso, mostrar mensaje informativo
            setPaymentStatus("idle");
            setInfoMessage("");
            
            console.warn("⏳ Usuario aún no es Premium. El pago aún se está procesando.");
            
            okAlert(
              "Procesando tu suscripción",
              "Tu pago está siendo procesado. Te enviaremos un correo con el estado en unos minutos."
            );

            try {
              await sendEmail();
            } catch (emailError) {
              console.error("Error al enviar correo de estado:", emailError);
            }
          }
        } catch (profileError) {
          console.error("Error al verificar perfil en modo poll:", profileError);
          setPaymentStatus("idle");
          setInfoMessage("");
          
          errAlert(
            "Verificación pendiente",
            "No pudimos confirmar el estado de tu suscripción. Por favor revisa tu perfil en unos minutos. Te enviaremos un correo con el estado."
          );
        }

        setIsLoading(false);
        return;
      }

      // Modo: Pago interactivo con PaymentSheet
      if (init.mode === "payment") {
        const { error } = await presentPaymentSheet();

        if (!mountedRef.current) return;

        if (error) {
          if (error.code === "Canceled") {
            setPaymentStatus("idle");
            setInfoMessage("");
            errAlert("Pago cancelado", "Has cancelado el proceso de pago");
          } else {
            throw new Error(
              error.message || "Ocurrió un error al procesar el pago"
            );
          }
        } else {
          // Pago exitoso
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
          } catch (emailError) {
            console.error("Error al enviar correo después de pago exitoso:", emailError);
            // No mostrar alerta de error si el pago se procesó correctamente
          }
        }
      }
    } catch (error: any) {
      if (!mountedRef.current) return;

      setPaymentStatus("error");
      setInfoMessage("");
      
      console.error("Error en handlePayment:", error);
      errAlert(
        "Error en el proceso",
        error.message || "Ocurrió un error al procesar tu suscripción. Por favor intenta de nuevo."
      );
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
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
        <View className="p-4 rounded-lg mb-6 border border-yellow-300" style={{ backgroundColor: '#18181b' }}>
          <Text className="text-lg font-semibold mb-2 text-yellow-100">
            Resumen del plan
          </Text>
          <Text className="mb-2 text-yellow-100">
            ⭐ {planLabel}
          </Text>
          <Text className="mb-2 text-xl font-bold text-yellow-200">
            💰 Precio: ${price.toFixed(2)} MXN / mes
          </Text>
          <Text className="text-sm mt-2 text-yellow-200">
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
