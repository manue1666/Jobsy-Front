import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    useColorScheme
} from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, updateUserProfile } from '../../helpers/profile';
import { router, Stack } from 'expo-router';

export default function EditProfileScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? 'text-white' : 'text-black';
    const subtitleColor = isDark ? 'text-gray-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100';

    const [profileData, setProfileData] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


    // Solicitar permisos
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la imagen.');
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
                setName(data.user.name || '');
                setEmail(data.user.email || '');
                setImageUri(data.user.profilePhoto || '');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Error al obtener el perfil');
            console.log(err);
            return null;
        } finally {
            setLoading(false);
        }

    }

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
            console.error('Error al seleccionar imagen:', error);
        }
    };

    const handleConfirm = async () => {
        Alert.alert('Datos actualizados', `Nombre: ${name}\nCorreo: ${email}`);
        try {
            const userId = profileData?._id;
            const updatePayload = {
                name,
                email,
                profilePhoto: imageUri,
            };

            await updateUserProfile(userId, updatePayload)
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            router.back();
        }
    };

    return (
        <ScreenContainer>
        <SafeAreaView className="flex-1 items-center justify-between px-4">
            <Stack.Screen options={{ title: 'Editar perfil' }} />
            {loading ? (<ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />) : (
                <>
                    <View className={`w-full p-6 rounded-3xl shadow-lg items-center space-y-4 ${cardBg}`}>

                        {/* Imagen */}
                        <TouchableOpacity onPress={pickImage}>
                            <Image
                                source={{
                                    uri: imageUri || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                                }}
                                className="w-56 h-56 rounded-full mt-4 mb-4"
                            />
                        </TouchableOpacity>

                        {/* Campos */}
                        <View className="w-full space-y-3 mt-8">
                            <Text className={`text-base ${textColor}`}>Nombre</Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl p-3 text-base"
                                placeholder="Tu nombre"
                                value={name}
                                onChangeText={setName}
                            />

                            <Text className={`text-base mt-8 ${textColor}`}>Correo electrónico</Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl p-3 text-base"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Botón Confirmar */}
                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="bg-blue-500 px-6 py-3 rounded-full mt-8"
                        >
                            <Text className="text-white text-base font-semibold">Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
        </ScreenContainer>
    );
}
