import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { ThemeContext } from "@/context/themeContext";
import {
  getPremiumStatus,
  cancelPremiumSubscription,
} from "@/helpers/suscription";
import { router, Stack } from "expo-router";

export default function SuscriptionsScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const cardBg = isDark
    ? "bg-gray-800 border border-gray-700"
    : "bg-white border border-gray-100";
  const accent = Colors[currentTheme as keyof typeof Colors].tint;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelAtPeriodEnd] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getPremiumStatus();
      setStatus(res);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "No se pudo obtener el estado de la suscripción"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await cancelPremiumSubscription(cancelAtPeriodEnd);
      Alert.alert(
        "Suscripción cancelada",
        cancelAtPeriodEnd
          ? "Tu suscripción se cancelará al final del periodo actual."
          : "Tu suscripción ha sido cancelada inmediatamente."
      );
      fetchStatus();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo cancelar la suscripción");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Informacion de la suscripción",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000", // Color del botón back
        }}
      />
      <ScrollView className="flex-1 px-6 py-6">
        <Text className={`text-3xl font-bold mb-6 text-center ${textColor}`}>
          Suscripción Premium
        </Text>
        {loading ? (
          <View className="flex-1 justify-center items-center mt-12">
            <ActivityIndicator size="large" color={accent} />
            <Text className={`mt-4 text-lg ${textColor}`}>Cargando estado...</Text>
          </View>
        ) : (
          <>
            {/* Card Estado y datos principales */}
            <View className={`rounded-2xl p-5 mb-6 shadow-sm ${cardBg}`}>
              <Text className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>Estado de la suscripción</Text>
              <View className="flex-row items-center mb-2 justify-center">
                <Feather name="star" size={28} color={accent} />
                <Text className={`ml-2 text-xl font-bold ${status.isPremium ? 'text-green-500' : 'text-red-500'}`}>{status.isPremium ? "Activo" : "No activo"}</Text>
              </View>
              <View className="flex-row items-center mb-2 justify-center">
                <Feather name="calendar" size={20} color={accent} />
                <Text className={`ml-2 text-base ${textColor}`}>Expira: <Text className="font-semibold">{status.premiumUntil ? new Date(status.premiumUntil).toLocaleString() : "-"}</Text></Text>
              </View>
              <View className="flex-row items-center mb-2 justify-center">
                <Feather name="user" size={20} color={accent} />
                <Text className={`ml-2 text-base ${textColor}`}>Stripe ID: <Text className="font-semibold">{status.stripeCustomerId || "-"}</Text></Text>
              </View>
              {status.subscription && (
                <View className="mt-2">
                  <Text className={`mb-2 text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>Suscripción</Text>
                  <View className="flex-row items-center mb-1">
                    <Feather name="hash" size={18} color={accent} />
                    <Text className={`ml-2 ${textColor}`}>ID: <Text className="font-semibold">{status.subscription.id}</Text></Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Feather name="info" size={18} color={accent} />
                    <Text className={`ml-2 ${textColor}`}>Estado: <Text className={`font-semibold ${status.subscription.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>{status.subscription.status}</Text></Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Feather name="dollar-sign" size={18} color={accent} />
                    <Text className={`ml-2 ${textColor}`}>Precio: <Text className="font-semibold">99 mxn</Text></Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Feather name="calendar" size={18} color={accent} />
                    <Text className={`ml-2 ${textColor}`}>Fin de periodo: <Text className="font-semibold">{status.subscription.currentPeriodEnd ? new Date(status.subscription.currentPeriodEnd).toLocaleString() : "-"}</Text></Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    <Feather name="alert-circle" size={18} color={accent} />
                    <Text className={`ml-2 ${textColor}`}>Cancelación al final del periodo: <Text className="font-semibold">{status.subscription.cancelAtPeriodEnd ? "Sí" : "No"}</Text></Text>
                  </View>
                  {status.subscription.defaultPaymentMethod && (
                    <View className="mt-2">
                      <Text className={`mb-1 text-lg font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>Método de pago</Text>
                      <View className="flex-row items-center mb-1">
                        <Feather name="credit-card" size={18} color={accent} />
                        <Text className={`ml-2 ${textColor}`}>Marca: <Text className="font-semibold">{status.subscription.defaultPaymentMethod.card?.brand || "-"}</Text></Text>
                      </View>
                      <View className="flex-row items-center mb-1">
                        <Feather name="hash" size={18} color={accent} />
                        <Text className={`ml-2 ${textColor}`}>Terminación: <Text className="font-semibold">{status.subscription.defaultPaymentMethod.card?.last4 || "-"}</Text></Text>
                      </View>
                      <View className="flex-row items-center mb-1">
                        <Feather name="calendar" size={18} color={accent} />
                        <Text className={`ml-2 ${textColor}`}>Expira: <Text className="font-semibold">{status.subscription.defaultPaymentMethod.card?.exp_month}/{status.subscription.defaultPaymentMethod.card?.exp_year}</Text></Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
            {/* Card Actualizar método de pago */}
            {status.isPremium && status.subscription && status.subscription.status !== "canceled" && (
              <View className={`rounded-2xl p-5 mb-6 shadow-sm ${cardBg}`}>  
                <Text className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-green-400' : 'text-green-700'}`}>Actualizar método de pago</Text>
                <Text className={`mb-2 text-base text-center ${textColor}`}>Puedes actualizar tu tarjeta o método de pago asociado a la suscripción premium.</Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push({ pathname: "/premium/update-payment" });
                  }}
                  className={`mt-2 py-3 px-6 rounded-xl bg-green-600`}
                  activeOpacity={0.85}
                >
                  <Text className="text-white text-center font-bold text-lg">Actualizar método de pago</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Card Cancelación */}
            {status.isPremium && status.subscription && status.subscription.status !== "canceled" && (
              <View className={`rounded-2xl p-5 mb-6 shadow-sm ${cardBg}`}>  
                <Text className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-red-400' : 'text-red-700'}`}>Cancelar suscripción</Text>
                <View className="flex-row items-center mb-2 justify-center">
                  <Feather name="alert-circle" size={22} color={accent} />
                  <Text className={`ml-2 ${textColor}`}>Cancelar al final del periodo</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={cancelLoading}
                  className={`mt-2 py-3 px-6 rounded-xl ${cancelLoading ? "bg-gray-400" : "bg-red-600"}`}
                  activeOpacity={0.85}
                >
                  {cancelLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-center font-bold text-lg">Cancelar suscripción</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            {/* Card Últimos pagos */}
            {status.invoices && status.invoices.length > 0 && (
              <View className={`rounded-2xl p-5 mb-6 shadow-sm ${cardBg}`}>
                <Text className={`text-2xl font-bold mb-4 text-center ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Últimos pagos</Text>
                {status.invoices.map((inv: any) => (
                  <View key={inv.id} className="mb-3">
                    <View className="flex-row items-center mb-1">
                      <Feather name="file-text" size={18} color={accent} />
                      <Text className={`ml-2 ${textColor}`}>ID: <Text className="font-semibold">{inv.id}</Text></Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Feather name="info" size={18} color={accent} />
                      <Text className={`ml-2 ${textColor}`}>Estado: <Text className={`font-semibold ${inv.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>{inv.status}</Text></Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Feather name="dollar-sign" size={18} color={accent} />
                      <Text className={`ml-2 ${textColor}`}>Pagado: <Text className="font-semibold">${(inv.amountPaid / 100).toFixed(2)} {inv.currency.toUpperCase()}</Text></Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Feather name="calendar" size={18} color={accent} />
                      <Text className={`ml-2 ${textColor}`}>Fecha: <Text className="font-semibold">{new Date(inv.created).toLocaleString()}</Text></Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                      <Feather name="calendar" size={18} color={accent} />
                      <Text className={`ml-2 ${textColor}`}>Fin de periodo: <Text className="font-semibold">{inv.periodEnd ? new Date(inv.periodEnd).toLocaleString() : "-"}</Text></Text>
                    </View>
                    {inv.hostedInvoiceUrl && (
                      <View className="flex-row items-center mb-1">
                        <Feather name="external-link" size={18} color={accent} />
                        <Text className={`ml-2 ${textColor}`}>Factura: <Text style={{ color: accent }} onPress={() => Linking.openURL(inv.hostedInvoiceUrl)}>Ver</Text></Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
