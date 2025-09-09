import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserProfile, updateUserProfile } from "../../helpers/profile";
import { router, Stack } from "expo-router";
import { FormCard } from "@/components/authComponents/FormCard";
import { FormInput } from "@/components/authComponents/FormInput";
import { ThemeContext } from "@/context/themeContext";
import { useAlert } from "@/components/mainComponents/Alerts";

export default function EditProfileScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  const [profileData, setProfileData] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const { okAlert, errAlert } = useAlert();

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        errAlert(
          "Permiso denegado",
          "Se necesita permiso para acceder a las fotos"
        );
      }
      loadProfileData();
    })();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      if (data?.user) {
        setProfileData(data);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setImageUri(data.user.profilePhoto || "");
      }
    } catch (err: any) {
      errAlert('Error', err.message || 'No se pudo cargar la información del perfil');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
    }
  };

  const handleConfirm = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!email.trim()) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Correo inválido";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    Alert.alert(
      "Datos actualizados",
      `Nombre: ${name}\nCorreo: ${email}`,
      [
        {
          text: "OK",
        },
      ],
      {
        cancelable: true,
      }
    );

    try {
      const userId = profileData?.user._id;
      await updateUserProfile(
        userId,
        { name, email }, // Datos normales
        imageUri !== profileData?.user.profilePhoto ? imageUri : null // Solo si es nueva imagen
      );
      okAlert("Éxito", "Perfil actualizado correctamente");
      router.back();
    } catch (error) {
      console.log(error);
      errAlert("Error", "No se pudo actualizar el perfil. Intenta más tarde.");
    }
  };

  return (
    <ScreenContainer dark={isDark}>
      <SafeAreaView className="flex-1 px-4">
        <Stack.Screen
          name="ChangeProfile"
          options={{
            title: "Editar perfil",
            headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" }, // Cambia el fondo del header
            headerTintColor: isDark ? "#ffffff" : "#000000", // Cambia el color del texto y flecha
          }}
        />
        {loading ? (
          <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
        ) : (
          <FormCard title="Editar perfil">
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{
                    uri:
                      imageUri ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  className="w-40 h-40 rounded-full"
                />
              </TouchableOpacity>
            </View>

            <FormInput
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              isRequired
              error={errors.name}
            />

            <FormInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              isRequired
              error={errors.email}
            />

            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-blue-500 px-6 py-3 rounded-full mt-6"
            >
              <Text className="text-white text-base font-semibold text-center">
                Confirmar
              </Text>
            </TouchableOpacity>
          </FormCard>
        )}
      </SafeAreaView>
    </ScreenContainer>
  );
}
