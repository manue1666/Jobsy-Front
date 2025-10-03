import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { AppLogo } from "@/components/authComponents/AppLogo";
import { FormInput } from "@/components/authComponents/FormInput";
import { PrimaryButton } from "@/components/authComponents/PrimaryButton";
import { loginUser } from "../../helpers/auth"; // Importa la función de login
import { useAlert } from "@/components/mainComponents/Alerts";
import { getUserProfile } from "@/helpers/profile";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { okAlert, errAlert } = useAlert();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const checkSession = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        try {
          await getUserProfile();
          router.replace("/(tabs)");
        } catch (error: any) {
          await AsyncStorage.removeItem("token");
        }
      }
    };
    checkSession();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginUser(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err?.status === 404 || err?.message?.includes("404")) {
        errAlert("Error", "Credenciales incorrectas");
      } else {
        errAlert("Error", "Error al iniciar sesión compruebe sus credenciales");
      }
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
