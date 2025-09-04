import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { getUserProfile } from '@/helpers/profile';

export interface UserProfile {
  user?: {
    name: string;
    profilePhoto: string;
  };
}

export function useUserProfile() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Error al obtener el perfil",
        [
          {
            text: "OK",
          },
        ],
        {
          cancelable: true,
        }
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { profileData, loading, loadProfileData };
}
