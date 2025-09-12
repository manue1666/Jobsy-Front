import React, { useState } from "react";
import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { FormInput } from "@/components/authComponents/FormInput";
import { PrimaryButton } from "@/components/authComponents/PrimaryButton";
import { useColorScheme } from "react-native";
import { useAlert } from "@/components/mainComponents/Alerts";
import { router, Stack } from "expo-router";
import { recoverPassword } from "@/helpers/recover_pwd";

export default function RecoverPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { okAlert, errAlert } = useAlert();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";


  const handleRecover = async () => {
    setLoading(true);
    try {
      const msg = await recoverPassword(email);
      router.replace("/(auth)");
      okAlert("Recuperación enviada", msg);
    } catch (err: any) {
      errAlert("Error", err.message || "No se pudo enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0;

  return (
    <ScreenContainer androidSafeArea={false}>
      <Stack.Screen
        options={{
          title: "Recuperar contraseña",
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000", // Color del botón back
        }}
      />
      <View className="flex-1 justify-center px-6">
        <FormCard title="Recuperar contraseña" scrollable={false}>

          <FormInput
            label="Email"
            placeholder="Tu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            isRequired
          />

          <PrimaryButton
            title="Recuperar contraseña"
            onPress={handleRecover}
            loading={loading}
            disabled={!isFormValid}
          />

          <View className="mt-8">
            <Text className={`${isDark ? "text-gray-300" : "text-gray-700"} text-sm text-center`}>
              Ingresa tu correo electrónico para recuperar tu contraseña.{"\n"}
              {"\n"}
              Recibirás un email con una nueva contraseña temporal.{"\n"}
              Por seguridad, te recomendamos cambiar esta contraseña inmediatamente después de iniciar sesión.{"\n"}
              {"\n"}
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
            </Text>
          </View>
        </FormCard>
      </View>
    </ScreenContainer>
  );
}
