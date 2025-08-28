import React, { useContext } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Stack, useRouter } from 'expo-router';
import { ThemeContext } from '@/context/themeContext';
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function PremiumHomeScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';
  const router = useRouter();

  return (
    <ScreenContainer>
      <Stack.Screen
        name="PremiumHome"
        options={{
          title: 'Plan Premium',
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#FFD700" : "#FFD700",
        }}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Premium Info Banner */}
        <View className={`mx-4 my-4 p-5 rounded-2xl ${isDark ? "bg-yellow-900" : "bg-yellow-50"} border border-yellow-300`}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={32} color="#FFD700" style={{ marginRight: 10 }} />
            <Text className={`font-bold text-xl ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>Beneficios Premium</Text>
          </View>
          <Text className={`mb-3 ${isDark ? "text-yellow-100" : "text-yellow-900"}`}>
            ¡Lleva tu experiencia Jobsy al siguiente nivel con el plan Premium!
          </Text>
          <View className="mb-2">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="add-circle-outline" size={22} color="#FFD700" style={{ marginRight: 8 }} />
              <Text className={`${isDark ? "text-yellow-100" : "text-yellow-900"}`}>Publica hasta <Text className="font-bold">5 servicios</Text> simultáneamente.</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Feather name="image" size={20} color="#FFD700" style={{ marginRight: 10 }} />
              <Text className={`${isDark ? "text-yellow-100" : "text-yellow-900"}`}>Sube hasta <Text className="font-bold">9 imágenes</Text> por servicio.</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="create-outline" size={20} color="#FFD700" style={{ marginRight: 10 }} />
              <Text className={`${isDark ? "text-yellow-100" : "text-yellow-900"}`}>Edita tus servicios publicados en cualquier momento.</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="alert-circle-outline" size={20} color="#FFD700" style={{ marginRight: 8 }} />
            <Text className={`text-xs ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>
              <Text className="font-bold">Nota:</Text> Los beneficios <Text className="font-bold">no son retroactivos</Text>, es decir, no se aplican a servicios ya publicados antes de adquirir el plan.
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="pricetag" size={20} color="#FFD700" style={{ marginRight: 8 }} />
            <Text className={`text-base font-semibold ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>
              $99 MXN / mes
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="close-circle-outline" size={20} color="#FFD700" style={{ marginRight: 8 }} />
            <Text className={`text-xs ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>
              Si cancelas el plan, los servicios publicados con beneficios premium <Text className="font-bold">no se verán afectados</Text>, pero perderás la opción de editarlos.
            </Text>
          </View>
          <TouchableOpacity
            className="mt-6 bg-yellow-400 rounded-full px-4 py-3 items-center"
            activeOpacity={0.85}
            onPress={() => router.push("/premium/confirmPremium")}
          >
            <Text className="text-white font-bold text-base">Solicitar plan Premium</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
