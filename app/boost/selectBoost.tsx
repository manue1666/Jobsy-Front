import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/ScreenContainer";
import { BOOST_PLANS } from "./boostHome";
import { ThemeContext } from "@/context/themeContext";

const PLAN_LABELS: Record<string, string> = {
  "24h": "24 horas",
  "72h": "72 horas",
  "1week": "1 semana",
};

export default function SelectBoostPlanScreen() {
  const params = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const serviceId = params.serviceId;
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const handleSelectPlan = (planId: string) => {
    router.push({
      pathname: "/boost/confirmBoost",
      params: { serviceId, planId },
    });
  };

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: "Selecciona un plan Boost",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <View
        className={`flex-1 px-6 py-6 ${isDark ? "bg-[#111823]" : "bg-white"}`}
      >
        <Text
          className={`text-lg font-bold mb-2 ${isDark ? "text-blue-100" : "text-blue-800"}`}
        >
          Selecciona un plan para impulsar tu servicio
        </Text>
        <Text className={`mb-4 ${isDark ? "text-blue-200" : "text-gray-700"}`}>
          Servicio seleccionado:{" "}
          <Text className="font-semibold">{serviceId}</Text>
        </Text>
        <View>
          {Object.entries(BOOST_PLANS).map(([planId, plan]) => (
            <TouchableOpacity
              key={planId}
              className={`flex-row items-center mb-4 p-4 rounded-xl border ${
                isDark
                  ? "border-blue-900 bg-blue-950"
                  : "border-blue-300 bg-blue-50"
              }`}
              activeOpacity={0.85}
              onPress={() => handleSelectPlan(planId)}
            >
              <Ionicons
                name="flash-outline"
                size={28}
                color="#2563eb"
                style={{ marginRight: 16 }}
              />
              <View className="flex-1">
                <Text
                  className={`font-semibold text-base ${isDark ? "text-blue-100" : "text-blue-900"}`}
                >
                  {PLAN_LABELS[planId]}
                </Text>
                <Text
                  className={`text-xs ${isDark ? "text-blue-200" : "text-blue-700"}`}
                >
                  {planId === "24h" && "Impulsa tu servicio por 24 horas"}
                  {planId === "72h" && "Impulsa tu servicio por 72 horas"}
                  {planId === "1week" && "Impulsa tu servicio por 1 semana"}
                </Text>
              </View>
              <Text
                className={`font-bold text-lg ${isDark ? "text-blue-200" : "text-blue-800"}`}
              >
                ${plan.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
