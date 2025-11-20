import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemeContext } from "@/context/themeContext";
import { boostService, getBoostStatus } from "@/helpers/boost_service";
import { useSafeStripe } from '@/hooks/useSafeStripe';
import { useAlert } from "@/components/mainComponents/Alerts";
import { getUserProfile } from "@/helpers/profile";

function ConfirmBoostScreen() {
  const params = useLocalSearchParams<{ 
    serviceId?: string; 
    planId?: string; 
    serviceName?: string;
  }>();
  
  const { currentTheme } = useContext(ThemeContext);
  const { initPaymentSheet, presentPaymentSheet, isAvailable, isLoading: stripeLoading } = useSafeStripe();
  const isDark = currentTheme === "dark";

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string>("");
  const { okAlert, errAlert } = useAlert();

  const planPrices = { '24h': 30, '72h': 70, '1week': 120 };
  const planDurations = { '24h': '24 horas', '72h': '72 horas', '1week': '1 semana' };
  const currentPrice = planPrices[params.planId as keyof typeof planPrices] || 0;
  const durationText = planDurations[params.planId as keyof typeof planDurations] || '';

  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  type InitResult =
    | { ok: true }
    | { ok: false; message?: string };

  const initializePaymentSheet = async (): Promise<InitResult>=> {
    if (!params.serviceId || !params.planId) {
      errAlert("Error", "ID de servicio o plan no proporcionado");
      return { ok: false, message: "Datos incompletos" };
    }

    try {
      console.log('[ConfirmBoost] Iniciando proceso de boost');
      
      let response: any;

      try {
        response = await boostService(params.serviceId, params.planId);
        
        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
          console.log('[ConfirmBoost] ClientSecret obtenido');
        }
        
      } catch (error: any) {
        // Manejar error 409 - Ya está promocionado
        if (error?.status === 409) {
          console.log('[ConfirmBoost] Servicio ya está promocionado');
          
          const hoursText = error.remainingHours === 1 ? 'hora' : 'horas';
          const minutesText = error.remainingMinutes === 1 ? 'minuto' : 'minutos';
          
          okAlert(
            "Ya está en Promoción",
            `Este servicio ya está siendo promocionado con el plan ${error.currentPlan || 'desconocido'}.\n\n` +
            `Tiempo restante: ${error.remainingHours || 0} ${hoursText} y ${error.remainingMinutes || 0} ${minutesText}.\n\n` +
            `Espera a que termine la promoción actual para activar una nueva.`
          );
          
          setTimeout(() => {
            if (mountedRef.current) {
              router.back();
            }
          }, 2000);
          
          return { ok: false, message: "Ya promocionado" };
        }
        
        // Otros errores
        console.error('[ConfirmBoost] Error en boostService:', error);
        throw error;
      }

      // Inicializar PaymentSheet con el clientSecret
      if (!response.clientSecret) {
        throw new Error('No se recibió clientSecret del servidor');
      }

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
        console.error('[ConfirmBoost] Error initializing payment sheet:', error);
        throw new Error(`Error al configurar pago: ${error.message}`);
      }

      console.log('[ConfirmBoost] ✅ PaymentSheet inicializado correctamente');
      return { ok: true };

    } catch (error: any) {
      setInfoMessage("");
      console.error('[ConfirmBoost] Error en initializePaymentSheet:', error);
      errAlert(
        "Error",
        error.message || "No se pudo iniciar el proceso de pago"
      );
      return { ok: false, message: error.message };
    }
  };

  const verifyBoostActivation = async (): Promise<boolean> => {
    try {
      console.log('[ConfirmBoost] Verificando activación del boost...');
      
      // Esperar a que el webhook procese (3 segundos)
      await delay(3000);
      
      if (!mountedRef.current) return false;

      // Obtener estado actualizado del servicio
      const status = await getBoostStatus(params.serviceId!);
      
      console.log('[ConfirmBoost] Estado del boost:', {
        isPromoted: status.isPromoted,
        remainingHours: status.remainingTime?.hours,
      });

      if (status.isPromoted) {
        console.log('[ConfirmBoost] ✅ Boost activado correctamente');
        return true;
      } else {
        console.log('[ConfirmBoost] ⚠️ Boost aún no activado, esperando más...');
        
        // Reintentar una vez más después de 2 segundos
        await delay(2000);
        
        if (!mountedRef.current) return false;
        
        const retryStatus = await getBoostStatus(params.serviceId!);
        return retryStatus.isPromoted;
      }
      
    } catch (error) {
      console.error('[ConfirmBoost] Error verificando boost:', error);
      return false;
    }
  };

  const handlePayment = async () => {
    if (!isAvailable) {
      errAlert("Error", "El sistema de pagos no está disponible en este momento.");
      return;
    }

    if (!mountedRef.current) return;

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      console.log('[ConfirmBoost] Iniciando proceso de pago');
      
      // Inicializar PaymentSheet
      const init = await initializePaymentSheet();
      
      if (!init.ok) {
        setIsLoading(false);
        setPaymentStatus('idle');
        return;
      }

      if (!mountedRef.current) return;

      console.log('[ConfirmBoost] Presentando PaymentSheet');
      setInfoMessage("Completa el pago para activar el boost...");

      // Presentar PaymentSheet
      const { error } = await presentPaymentSheet();
      
      if (!mountedRef.current) return;

      if (error) {
        console.error('[ConfirmBoost] Payment sheet error:', error);
        
        // No es un error si el usuario cancela
        if (error.code === 'Canceled') {
          setPaymentStatus('idle');
          setInfoMessage("");
          okAlert("Pago cancelado", "El proceso de pago fue cancelado.");
        } else {
          throw new Error(error.message || "Ocurrió un error al procesar el pago");
        }
      } else {
        // Pago completado en el cliente
        console.log('[ConfirmBoost] ✅ Pago completado en cliente');
        setInfoMessage("Verificando activación del boost...");
        
        // Verificar que el boost se activó correctamente
        const isActivated = await verifyBoostActivation();
        
        if (!mountedRef.current) return;
        
        if (isActivated) {
          setPaymentStatus('success');
          setInfoMessage("");
          okAlert(
            "¡Boost Activado!", 
            `Tu servicio está siendo promocionado con el plan ${params.planId} durante ${durationText}. ` +
            `Ahora aparecerá destacado en los resultados de búsqueda.`,
            [{ 
              text: "Aceptar", 
              onPress: () => {
                if (mountedRef.current) {
                  router.back();
                }
              }
            }]
          );
        } else {
          // Pago exitoso pero boost no activado aún
          setPaymentStatus('success');
          setInfoMessage("");
          okAlert(
            "Pago Procesado",
            "Tu pago fue procesado correctamente. El boost se activará en los próximos minutos.",
            [{ 
              text: "Aceptar", 
              onPress: () => {
                if (mountedRef.current) {
                  router.back();
                }
              }
            }]
          );
        }
      }
    } catch (error: any) {
      if (!mountedRef.current) return;

      setPaymentStatus('error');
      setInfoMessage("");
      
      console.error('[ConfirmBoost] Error en handlePayment:', error);
      errAlert(
        "Error en el Proceso",
        error.message || "Ocurrió un error al procesar el boost. Por favor intenta de nuevo."
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
          <ActivityIndicator size="large" color={isDark ? "#3b82f6" : "#2563eb"} />
          <Text className={`text-center mt-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
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
          <Text className={`text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Estamos teniendo problemas técnicos. Por favor intenta más tarde.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 py-3 px-6 bg-blue-600 rounded-lg"
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
          title: "Confirmar Boost",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />

      <View className={`flex-1 px-6 py-8 ${isDark ? "bg-[#111823]" : "bg-white"}`}>
        <Text className={`text-2xl font-bold mb-6 text-center ${isDark ? "text-blue-100" : "text-blue-800"}`}>
          Confirmar Boost
        </Text>

        {/* Información del servicio */}
        <View className={`p-4 rounded-lg mb-6 ${isDark ? "bg-blue-900" : "bg-blue-50"}`}>
          <Text className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-blue-800"}`}>
            Resumen del Boost
          </Text>
          
          {params.serviceName && (
            <Text className={`mb-3 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
              🛠️ Servicio: {params.serviceName}
            </Text>
          )}
          
          <Text className={`mb-2 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
            ⚡ Plan: {params.planId} ({durationText})
          </Text>
          <Text className={`mb-4 text-xl font-bold ${isDark ? "text-blue-100" : "text-blue-800"}`}>
            💰 Precio: ${currentPrice.toFixed(2)} MXN
          </Text>
          
          <Text className={`text-sm mt-2 ${isDark ? "text-blue-300" : "text-gray-500"}`}>
            Tu servicio aparecerá destacado en los resultados de búsqueda durante {durationText.toLowerCase()}, 
            aumentando significativamente su visibilidad y probabilidad de contratación.
          </Text>
        </View>

        {/* Mensaje informativo */}
        {infoMessage && (
          <View className={`p-3 rounded-lg mb-4 ${isDark ? "bg-blue-800" : "bg-blue-100"}`}>
            <Text className={`text-center ${isDark ? "text-blue-200" : "text-blue-800"}`}>
              {infoMessage}
            </Text>
          </View>
        )}

        {/* Botón de pago */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={isLoading || paymentStatus === 'processing'}
          className={`py-4 px-6 rounded-lg mb-4 ${
            isLoading || paymentStatus === 'processing' ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {isLoading || paymentStatus === 'processing' ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator color="#ffffff" />
              <Text className="text-white ml-2 font-bold text-lg">
                {paymentStatus === 'processing' ? 'Procesando pago...' : 'Cargando...'}
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              💳 Pagar ${currentPrice.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Estado del pago */}
        {paymentStatus === 'success' && !infoMessage && (
          <View className="bg-green-100 p-3 rounded-lg mb-4">
            <Text className="text-green-800 text-center">
              ✅ Pago completado. Tu servicio está siendo boosteado.
            </Text>
          </View>
        )}

        {paymentStatus === 'error' && (
          <View className="bg-red-100 p-3 rounded-lg mb-4">
            <Text className="text-red-800 text-center">
              ❌ Error en el pago. Por favor intenta nuevamente.
            </Text>
          </View>
        )}

        {/* Información de seguridad */}
        <View className={`p-3 rounded-lg mt-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <Text className={`text-xs text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            🔒 Pagos seguros procesados por Stripe. Tus datos están protegidos.
          </Text>
        </View>

        {/* Botón de cancelar */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isLoading || paymentStatus === 'processing'}
          className="mt-4 py-3 px-6 border border-gray-300 rounded-lg"
        >
          <Text className={`text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

export default ConfirmBoostScreen;