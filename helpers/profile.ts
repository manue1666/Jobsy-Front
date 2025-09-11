import api from "@/request";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) throw new Error("No token found");

    //llamada a la api
    const response = await api.get("/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Error al obtener perfil";
    throw new Error(message);
  }
};

export const deleteUserProfile = async (userId: string) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found");

    //llamada a la api
    const response = await api.delete("/user/delete/${userId}", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Error al eliminar perfil";
    throw new Error(message);
  }
};

export const updateUserProfile = async (
  userId: string,
  dataToUpdate: any,
  imageUri?: string | null
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const formData = new FormData();

    // 1. Si hay imagen nueva, prepara FormData
    if (imageUri) {
      formData.append("profileImage", {
        uri: imageUri,
        type: "image/jpeg", // o detectar tipo real
        name: `profile-${userId}-${Date.now()}.jpg`,
      } as any);
    }

    // 2. Añade otros campos al FormData
    Object.keys(dataToUpdate).forEach((key) => {
      formData.append(key, dataToUpdate[key]);
    });

    // 3. Envía con headers multipart
    const response = await api.patch(`/user/patch/${userId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Error al actualizar perfil";
    throw new Error(message);
  }
};

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const payload = {
      currentPassword,
      password: newPassword,
    };

    const response = await api.patch("/user/password", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || "Error al actualizar contraseña";
    throw new Error(message);
  }
};
