import React, { useState, useCallback, useContext, } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, Feather, Entypo } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteUserProfile, getUserProfile } from '../../helpers/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '@/context/themeContext';
import { BannerPremium } from '@/components/mainComponents/principal/bannerPremium';

export default function ProfileScreen() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const textColor = isDark ? 'text-white' : 'text-black';
  const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100';
  const logoutBg = isDark ? 'bg-gray-900 border border-red-800' : 'bg-white border border-red-200';

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );


  //metodo para cargar info del perfil
  const loadProfileData = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfileData(data);
      return data;
    } catch (err: any) {
      Alert.alert('Error',err.message || 'Error al obtener el perfil',[
        {
          text : 'OK'
        }
        ], {
        cancelable : true
        });
      console.log(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAccount = async () => {
    try {
      const userId = profileData?.user?._id;

      Alert.alert(
        'Confirmar', 'Estas seguro de que deseas eliminar tu cuenta?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Si, eliminar', style: 'destructive',
          onPress: async () => {
            await deleteUserProfile(userId);
            await AsyncStorage.removeItem('token');
            router.replace('/(auth)');
          },
        },
      ]
      );
    }
    catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo eliminar la cuenta',[
        {
          text : 'OK'
        }
        ], {
        cancelable : true
        });
      console.log(err);
    }
  };

  const profileOptions = [
    {
      icon: (color: string) => <Ionicons name="information-circle-outline" size={24} color={color} />,
      title: 'Editar información',
      subtitle: 'Cambiar nombre, teléfono, etc.',
      onPress: () => router.push('/perfil/edit'),
    },
    {
      icon: (color: string) => <Feather name="lock" size={24} color={color} />,
      title: 'Cambiar contraseña',
      subtitle: 'Establecer una nueva contraseña',
      onPress: () => router.push('/perfil/password'),
    },
    {
      icon: (color: string) => <MaterialIcons name="delete-outline" size={24} color={color} />,
      title: 'Eliminar cuenta',
      subtitle: 'Elimina definitivamente tu perfil',
      onPress: onDeleteAccount,
    },
    {
      icon: (color: string) => <Feather name="file-text" size={24} color={color} />,
      title: 'Mis publicaciones',
      subtitle: 'Administra tus servicios publicados',
      onPress: () => router.push('/perfil/publicados'),
    },
  ];

  return (
    <ScreenContainer>
      <SafeAreaView className="flex-1 items-center px-6 py-4 justify-between">
        <ScrollView
          className="w-full"
          contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full items-center">
            {/* Título */}
            <Text className={`text-3xl font-semibold mb-4 ${textColor}`}>Mi perfil</Text>
          </View>

          {loading ? (<ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />) : (
            <>
              <View className="w-full items-center">
                {/* Imagen y nombre */}
                <View className="relative">
                  <Image
                    source={{ uri: profileData.user?.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                    className="w-56 h-56 rounded-full mt-4 mb-4"
                  />
                  {profileData.user?.isPremium && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        backgroundColor: '#fffbe6',
                        borderRadius: 999,
                        padding: 6,
                        borderWidth: 2,
                        borderColor: '#FFD700',
                        elevation: 3,
                      }}
                    >
                      <Ionicons name="star" size={28} color="#FFD700" />
                    </View>
                  )}
                </View>
                <Text className={`text-3xl font-medium mb-1 ${textColor}`}>{profileData.user?.name}</Text>
                <Text className={`text-lg font-light mb-2 ${textColor}`}>{profileData.user?.email}</Text>
                {profileData.user?.isPremium && (
                  <View className="flex-row items-center justify-center mb-4">
                    <View className="flex-row items-center px-4 py-1 rounded-full bg-yellow-100 border border-yellow-300" style={{ elevation: 2 }}>
                      <Ionicons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
                      <Text className="text-xs font-bold text-yellow-800">Usuario Premium</Text>
                    </View>
                  </View>
                )}
                {/* Opciones */}
                <View className="w-full space-y-3">
                  <BannerPremium />
                  {profileOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={option.onPress}
                      className={`flex-row items-center p-4 mt-1 rounded-3xl ${cardBg}`}
                    >
                      <View className="mr-3">{option.icon(isDark ? 'white' : 'black')}</View>
                      <View>
                        <Text className={`font-semibold ${textColor}`}>{option.title}</Text>
                        <Text className={`text-sm ${subtitleColor}`}>{option.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cerrar sesión */}
              <TouchableOpacity
                onPress={() => router.replace('/(auth)')}
                className={`flex-row items-center justify-center p-4 mt-6 rounded-3xl w-full ${logoutBg}`}
              >
                <Entypo name="log-out" size={22} color={isDark ? 'white' : 'black'} />
                <Text className={`font-medium ml-2 ${textColor}`}>Cerrar sesión</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}
