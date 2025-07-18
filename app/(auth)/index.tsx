import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';

// Import your custom components
import { ScreenContainer } from '@/components/ScreenContainer';
import { FormCard } from '@/components/FormCard';
import { AppLogo } from '@/components/AppLogo';
import { FormInput } from '@/components/FormInput';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Implement login logic
    console.log('Login pressed', { email, password });
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <ScreenContainer
      backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
      hasOverlay={true}
      overlayOpacity={isDark ? 0.5 : 0.2}
    >
      <View className="flex-1 justify-center px-6">
        <FormCard title="Inicia sesión" scrollable={false}>
          {/* Logo */}
          <View className="mb-8">
            <AppLogo variant="colored" size="medium" />
          </View>

          {/* Form Fields */}
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

          {/* Forgot Password */}
          <TouchableOpacity className="mb-6">
            <Text className={`${isDark ? 'text-blue-300' : 'text-blue-500'} text-right text-sm`}>
              ¿Olvidaste tu contraseña?
			  {/* TODO: implementar el sistema de olvidado de contraseña*/}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <PrimaryButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            disabled={!isFormValid}
          />
        </FormCard>
      </View>
    </ScreenContainer>
  );
}