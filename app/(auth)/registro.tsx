import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { FormCard } from '@/components/authComponents/FormCard';
import { AppLogo } from '@/components/authComponents/AppLogo';
import { FormInput } from '@/components/authComponents/FormInput';
import { PrimaryButton } from '@/components/authComponents/PrimaryButton';
import { Checkbox } from '@/components/authComponents/Checkbox';
import { useAlert } from '@/components/mainComponents/Alerts';

import { registerUser } from '../../helpers/auth'; // Importa la función de registro

export default function RegistroScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { okAlert, errAlert } = useAlert();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerUser(name, email, password);
      router.replace('/(auth)');
      okAlert('Éxito', 'Registro completado. Ahora puedes iniciar sesión');
      console.log("Usuario registrado exitosamente");
    } catch (err: any) {
      errAlert('Error', err.message || 'Error al registrar usuario');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.length > 0 && email.length > 0 && password.length > 0 && acceptTerms;

  return (
    <ScreenContainer androidSafeArea={false}>
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
          {loading ? (
            <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
          ) : (
            <PrimaryButton
              title="Registrarme"
              onPress={handleRegister}
              loading={loading}
              disabled={!isFormValid}
            />
          )}
        </FormCard>
      </View>
      {/* Las alertas locales han sido eliminadas, ahora se usan globalmente */}
    </ScreenContainer>
  );
}