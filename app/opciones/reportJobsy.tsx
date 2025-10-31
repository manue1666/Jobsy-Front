import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useColorScheme } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { Stack, useLocalSearchParams } from "expo-router";
import { AppLogo } from "@/components/authComponents/AppLogo";
import { ThemeContext } from "@/context/themeContext";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  subject: string;
  bodyTemplate: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: "bug",
    title: "Reportar Bug",
    description: "Encontraste un error o funcionamiento inesperado",
    icon: "bug-report",
    color: "bg-red-500",
    subject: "Reporte de Bug - Jobsy",
    bodyTemplate: "He encontrado un bug en la aplicación:\n\nDescripción del problema:\n",
  },
  {
    id: "fallo",
    title: "Fallo Técnico",
    description: "La app se congela, se bloquea o funciona lentamente",
    icon: "signal-cellular-no-sim",
    color: "bg-orange-500",
    subject: "Reporte de Fallo Técnico - Jobsy",
    bodyTemplate: "Estoy experimentando un fallo técnico:\n\nDescripción del fallo:\n",
  },
  {
    id: "atencion",
    title: "Atención al Cliente",
    description: "Necesitas ayuda o tienes una pregunta",
    icon: "support-agent",
    color: "bg-blue-500",
    subject: "Consulta de Atención al Cliente - Jobsy",
    bodyTemplate: "Tengo una consulta o necesito ayuda:\n\nMi pregunta es:\n",
  },
  {
    id: "recomendacion",
    title: "Recomendación",
    description: "Sugerencias para mejorar la app",
    icon: "lightbulb",
    color: "bg-yellow-500",
    subject: "Recomendación de Mejora - Jobsy",
    bodyTemplate: "Tengo una recomendación para mejorar Jobsy:\n\nMi sugerencia es:\n",
  },
];

export default function ReportJobsyScreen() {
  const { currentTheme } = React.useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const handleReportPress = (reportType: ReportType) => {
    const subject = encodeURIComponent(reportType.subject);
    const body = encodeURIComponent(reportType.bodyTemplate);
    const mailto = `mailto:reportesjobsy@gmail.com?subject=${subject}&body=${body}`;
    Linking.openURL(mailto);
  };

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Reportes de Jobsy",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
        }}
      />
      <ScrollView className="flex-1 px-6">
        <FormCard title="Centro de Reportes" scrollable={false}>
          <View className="mb-6">
            <AppLogo variant="colored" size="medium" />
          </View>

          {/* Descripción General */}
          <Text
            className={`${
              isDark ? "text-gray-300" : "text-gray-700"
            } text-base mb-6 leading-6`}
          >
            En Jobsy nos importa tu experiencia. A través de este centro puedes
            reportar bugs, fallos técnicos, contactar atención al cliente, o
            enviarnos tus recomendaciones.
            {"\n\n"}
            Cada reporte nos ayuda a mejorar y garantizar que disfrutes de la
            mejor plataforma posible. ¡Gracias por tu feedback!
          </Text>

          {/* Grid de Reportes */}
          <View className="gap-4 mb-6">
            {REPORT_TYPES.map((reportType) => (
              <TouchableOpacity
                key={reportType.id}
                onPress={() => handleReportPress(reportType)}
                className={`${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                } p-4 rounded-xl flex-row items-center gap-3 active:opacity-70`}
                activeOpacity={0.7}
              >
                <View className={`${reportType.color} p-3 rounded-lg`}>
                  <MaterialIcons name={reportType.icon as any} size={24} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {reportType.title}
                  </Text>
                  <Text
                    className={`text-xs mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {reportType.description}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#D1D5DB"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Nota Final */}
          <View
            className={`${
              isDark ? "bg-gray-800" : "bg-blue-50"
            } p-4 rounded-lg border ${isDark ? "border-gray-700" : "border-blue-200"}`}
          >
            <Text
              className={`text-xs ${
                isDark ? "text-gray-300" : "text-blue-800"
              } leading-5`}
            >
              <Text className="font-semibold">📧 Nota:</Text> Se abrirá tu
              aplicación de correo con un mensaje preformateado. Completa los
              detalles y envía tu reporte directamente a nuestro equipo.
            </Text>
          </View>
        </FormCard>
      </ScrollView>
    </ScreenContainer>
  );
}
