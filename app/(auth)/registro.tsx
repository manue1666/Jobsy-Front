import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';

export default function RegistroScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = () => {
    console.log('Register pressed', { name, email, password, acceptTerms });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#ffffff'}
      />

      {/* Header */}
      <View className={`rounded-b-[50px] px-6 pt-16 pb-16 ${isDark ? 'bg-blue-700' : 'bg-blue-500'}`}>
        <View className="items-center mb-8">

          <View className="bg-white rounded-2xl p-3 mb-4">
            <View className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center">
              <Text className="text-white-500 font-bold text-lg">J</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold">Jobsy</Text>
          <Text className="text-blue-100 text-sm">Profesionales a tu alcance</Text>
        </View>
        <Text className="text-white text-2xl font-bold text-center">Bienvenid@.</Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-6 -mt-8">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 shadow-lg`}>
            <Text className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-center text-xl font-bold mb-6`}>Regístrate</Text>

            {/* Name */}
            <View className="mb-4">
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>Name</Text>
              <TextInput
                className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-4 text-base ${isDark ? 'text-white' : 'text-black'}`}
                placeholder="Tu nombre completo"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={name}
                onChangeText={setName}
              />
            </View>
            {/* Email */}
            <View className="mb-4">
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>Email</Text>
              <TextInput
                className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-4 text-base ${isDark ? 'text-white' : 'text-black'}`}
                placeholder="Tu email"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {/* Password */}
            <View className="mb-6">
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>Password</Text>
              <TextInput
                className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-4 text-base ${isDark ? 'text-white' : 'text-black'}`}
                placeholder="Tu contraseña"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            {/* Terms */}
            <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} className="flex-row items-center mb-6">
              <View
                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  acceptTerms ? 'bg-blue-500 border-blue-500' : (isDark ? 'border-gray-600' : 'border-gray-300')
                }`}
              >
                {acceptTerms && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm flex-1`}>Estoy de acuerdo con los términos y condiciones</Text>
            </TouchableOpacity>
            {/* Button */}
            <TouchableOpacity
              onPress={handleRegister}
              className="bg-blue-500 rounded-full py-4 mb-6 shadow-md"
              disabled={!acceptTerms}
            >
              <Text className="text-white text-center font-bold text-lg">Registrarme</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}