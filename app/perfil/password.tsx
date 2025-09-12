// app/profile/change-password.tsx

import React, { useContext, useEffect, useState } from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/ScreenContainer";
import { FormCard } from "@/components/authComponents/FormCard";
import { FormInput } from "@/components/authComponents/FormInput";
import { Stack, router } from "expo-router";
import { getUserProfile, updateUserPassword } from "../../helpers/profile";
import { ThemeContext } from "@/context/themeContext";
import { useAlert } from "@/components/mainComponents/Alerts";
import { PasswordMeter } from '@/components/authComponents/PasswordMeter';

export default function ChangePasswordScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [profileData, setProfileData] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { okAlert, errAlert } = useAlert();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const data = await getUserProfile();
      if (data?.user) {
        setProfileData(data);
      }
    } catch (err: any) {
      errAlert(
        "Error",
        err.message || "No se pudo cargar la información del perfil"
      );
      console.log(err);
    }
  };

  const handleChangePassword = async () => {
    const newErrors: typeof errors = {};

    if (!currentPassword)
      newErrors.currentPassword = "Este campo es obligatorio";
    if (!newPassword) newErrors.newPassword = "Este campo es obligatorio";
    if (!confirmPassword)
      newErrors.confirmPassword = "Este campo es obligatorio";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updateUserPassword(currentPassword, newPassword);

      okAlert("Éxito", "Contraseña actualizada correctamente");
      router.back();
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("contraseña actual")) {
        setErrors({ currentPassword: "Contraseña actual incorrecta" });
      } else {
        errAlert("Error", msg || "No se pudo actualizar la contraseña");
      }
    }
  };

  return (
    <ScreenContainer>
      <SafeAreaView className="flex-1 px-4">
        <Stack.Screen
          name="ChangePassword"
          options={{
            title: "Cambiar contraseña",
            headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" }, // Cambia el fondo del header
            headerTintColor: isDark ? "#ffffff" : "#000000", // Cambia el color del texto y flecha
          }}
        />

        <FormCard title="Actualiza tu contraseña">
          <FormInput
            label="Contraseña actual"
            isRequired
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              setErrors((prev) => ({ ...prev, currentPassword: "" }));
            }}
            secureTextEntry
            placeholder="Ingresa tu contraseña actual"
            error={errors.currentPassword}
          />

          <FormInput
            label="Nueva contraseña"
            isRequired
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Ingresa tu nueva contraseña"
            error={errors.newPassword}
          />

          <Text className="text-xs text-gray-500 mb-2">
            Usa al menos 8 caracteres, incluyendo una mayúscula, un número y un símbolo especial para mayor seguridad.
          </Text>
          <PasswordMeter password={newPassword} />

          <FormInput
            label="Confirmar nueva contraseña"
            isRequired
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Repite la nueva contraseña"
            error={errors.confirmPassword}
          />

          <TouchableOpacity
            onPress={handleChangePassword}
            className="bg-blue-500 px-6 py-3 rounded-full mt-6"
          >
            <Text className="text-white text-center text-base font-semibold">
              Guardar contraseña
            </Text>
          </TouchableOpacity>
        </FormCard>
      </SafeAreaView>
    </ScreenContainer>
  );
}
