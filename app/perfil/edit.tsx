import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);

    // Solicitar permisos
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la imagen.');
            }
        })();
    }, []);

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

    const handleConfirm = () => {
        Alert.alert('Datos actualizados', `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone}`);
        // Aquí podrías hacer la petición a la API para guardar los cambios
    };

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white px-4">
            {/* CARD */}
            <View className="bg-white w-full p-6 rounded-3xl shadow-lg items-center space-y-4">

                {/* Imagen */}
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={{
                            uri: imageUri || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                        }}
                        className="w-32 h-32 rounded-full"
                    />
                </TouchableOpacity>

                {/* Campos */}
                <View className="w-full space-y-3">
                    <Text className="text-base text-gray-600">Nombre</Text>
                    <TextInput
                        className="bg-gray-100 rounded-xl p-3 text-base"
                        placeholder="Tu nombre"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text className="text-base text-gray-600">Correo electrónico</Text>
                    <TextInput
                        className="bg-gray-100 rounded-xl p-3 text-base"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text className="text-base text-gray-600">Teléfono</Text>
                    <TextInput
                        className="bg-gray-100 rounded-xl p-3 text-base"
                        placeholder="1234567890"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Botón Confirmar */}
                <TouchableOpacity
                    onPress={handleConfirm}
                    className="bg-blue-500 px-6 py-3 rounded-full mt-4"
                >
                    <Text className="text-white text-base font-semibold">Confirmar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
