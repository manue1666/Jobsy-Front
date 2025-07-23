import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import api from '@/request'; //instancia de axios

// Import your custom components
import { ScreenContainer } from '@/components/ScreenContainer';
import { FormCard } from '@/components/FormCard';
import { AppLogo } from '@/components/AppLogo';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Checkbox } from '@/components/Checkbox';

export default function RegistroScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);


  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  const handleRegister = async () => {
    try {
      if(!name || !email || !password){
        Alert.alert("Error", "Datos incompletos")
        return
      }
      if(!acceptTerms){
        Alert.alert("Error","Debes aceptar terminos y condiciones")
        return
      }
      setLoading(true)

      const userData = {
        name,
        email,
        password
      }


      const response = await api.post("/user/regist", userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      // En registro normalmente no se recibe token, solo confirmación
      if (response.data && response.data.success) {
        Alert.alert("Éxito", "Registro completado. Ahora puedes iniciar sesión");
        
      } else {
        const errorMessage = response.data.message || "Error en el registro";
        Alert.alert("Error", errorMessage);
      }

      router.replace("/(auth)")


    } catch (error) {
      Alert.alert("Error", "Ocurrio un error en el servidor")
      console.log(error)
    } finally{
      setLoading(false)
    }
  };

  const isFormValid = name.length > 0 && email.length > 0 && password.length > 0 && acceptTerms;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className={`rounded-b-[50px] px-9 pt-16 pb-16 ${isDark ? 'bg-blue-700' : 'bg-blue-500'}`}>
        <View className="items-center mb-8">
          <AppLogo variant="light" size="medium" />
        </View>
        <Text className="text-white text-2xl font-bold text-center">Bienvenid@.</Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-6 -mt-9">
        <FormCard title="Regístrate">
          <FormInput
            label="Nombre"
            placeholder="Tu nombre completo"
            value={name}
            onChangeText={setName}
            isRequired
          />

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

          {/* Terms Checkbox */}
          <View className="mb-6">
            <Checkbox
              checked={acceptTerms}
              onPress={() => setAcceptTerms(!acceptTerms)}
              label="Estoy de acuerdo con los términos y condiciones"
            />
          </View>

          {/* Register Button */}
          <PrimaryButton
            title="Registrarme"
            onPress={handleRegister}
            loading={loading}
            disabled={!isFormValid}
          />
        </FormCard>
      </View>
    </ScreenContainer>
  );
}