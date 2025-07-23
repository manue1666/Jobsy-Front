import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { router } from 'expo-router';
import { Ionicons, MaterialIcons, Feather, Entypo } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? 'text-white' : 'text-black';
  const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-neutral-800' : 'bg-neutral-100';
  const logoutBg = isDark ? 'bg-neutral-700' : 'bg-neutral-200';

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  //Llamada a la API simulada para carga de datos del perfil
   useEffect(() => {
    setTimeout(() => {
      setProfileData({
        name: 'Gabriel Rodriguez',
        phone: '6645756284',
        email: 'gabriel.rm0027@gmail.com',
      });
      setLoading(false);
    }, 1000);
  }, []);

  const profileOptions = [
    {
      icon: (color: string) => <Ionicons name="information-circle-outline" size={24} color={color} />,
      title: 'Editar información',
      subtitle: 'Cambiar nombre, teléfono, etc.',
      //onPress: () => router.push('/edit-profile'),
    },
    {
      icon: (color: string) => <Feather name="lock" size={24} color={color} />,
      title: 'Cambiar contraseña',
      subtitle: 'Establecer una nueva contraseña',
      //onPress: () => router.push('/change-password'),
    },
    {
      icon: (color: string) => <MaterialIcons name="delete-outline" size={24} color={color} />,
      title: 'Eliminar cuenta',
      subtitle: 'Elimina definitivamente tu perfil',
      //onPress: () => router.push('/delete-account'),
    },
    {
      icon: (color: string) => <Feather name="file-text" size={24} color={color} />,
      title: 'Mis publicaciones',
      subtitle: 'Administra tus servicios publicados',
      //onPress: () => router.push('/my-posts'),
    },
  ];

  return (
    <ScreenContainer>
      <SafeAreaView className="flex-1 items-center px-6 py-4 justify-between bg-black">
		<View className="w-full items-center">
			{/* Título */}
        <Text className={`text-3xl font-semibold mb-4 ${textColor}`}>Mi perfil</Text>
		</View>
		
		{loading ? (<ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />) : (
		<>
		<View className="w-full items-center">
        {/* Imagen y nombre */}
        <Image
          source={{ uri: 'https://sistemas.com/termino/wp-content/uploads/Usuario-Icono.jpg' }}
          className="w-56 h-56 rounded-full mt-4 mb-4"
        />
        <Text className={`text-3xl font-medium mb-1 ${textColor}`}>{profileData.name}</Text>
		<Text className={`text-lg font-light mb-6 ${textColor}`}>{profileData.email}</Text>

        {/* Opciones */}
        <View className="w-full space-y-3">
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              //onPress={option.onPress}
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
		
      </SafeAreaView>
    </ScreenContainer>
  );
}
