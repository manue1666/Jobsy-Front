import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "react-native";

import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { AppLogo } from "@/components/authComponents/AppLogo";
import { FormInput } from "@/components/authComponents/FormInput";
import { PrimaryButton } from "@/components/authComponents/PrimaryButton";
import { loginUser } from "../../helpers/auth"; // Importa la función de login
import { useAlert } from "@/components/mainComponents/Alerts";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { okAlert, errAlert } = useAlert();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginUser(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      errAlert("Error", err.message || "Error al iniciar sesión");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <ScreenContainer androidSafeArea={false}>
      <View className="flex-1 justify-center px-6">
        <FormCard title="Inicia sesión" scrollable={false}>
          {/* Logo */}
          <View className="mb-8">
            <AppLogo variant="colored" size="medium" />
          </View>

          {/* Form Fields */}
          <FormInput
            label="Email"
            placeholder="Tu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            isRequired
          />

          <FormInput
            label="Password"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            isRequired
          />

          {/* Forgot Password */}
          <TouchableOpacity className="mb-6" onPress={() => router.push("/recover/recover_password")}> 
            <Text
              className={`${isDark ? "text-blue-300" : "text-blue-500"} text-right text-sm`}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          {loading ? (
            <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
          ) : (
            <PrimaryButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid}
            />
          )}
        </FormCard>
      </View>
    </ScreenContainer>
  );
}
