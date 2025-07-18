import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';

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
    setLoading(true);
    console.log('Register pressed', { name, email, password, acceptTerms });
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  const isFormValid = name.length > 0 && email.length > 0 && password.length > 0 && acceptTerms;

  return (
    <ScreenContainer>
      {/* Header */}
      <View className={`rounded-b-[50px] px-6 pt-16 pb-16 ${isDark ? 'bg-blue-700' : 'bg-blue-500'}`}>
        <View className="items-center mb-9">
          <AppLogo variant="light" size="medium" />
        </View>
        <Text className="text-white text-2xl font-bold text-center">Bienvenid@.</Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-6 -mt-8">
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