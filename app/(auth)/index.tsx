import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground,
  StatusBar,
  SafeAreaView,
  useColorScheme
} from 'react-native';
import { router } from 'expo-router';
import '@/global.css'

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log('Login pressed', { email, password });
    // Navigate to main app after successful login
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#ffffff'}/>
      
      {/* Background Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' }}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Semi-transparent overlay */}
        <View className={`flex-1 ${isDark ? 'bg-black/50' : 'bg-black/20'}`}>
          
          {/* Login Form Container */}
          <View className="flex-1 justify-center px-6">
            <View className={`${isDark ? 'bg-gray-800/95' : 'bg-white/95'} rounded-3xl p-8 shadow-lg`}>
              
              {/* Logo */}
              <View className="items-center mb-8">

                <View className="bg-blue-500 rounded-2xl p-3 mb-4">
                  <View className="w-8 h-8 bg-white rounded-lg items-center justify-center">
                    <Text className="text-blue-500 font-bold text-lg">J</Text>
                  </View>
                </View>
				
                <Text className="text-blue-500 text-2xl font-bold">Jobsy</Text>
                <Text className="text-gray-600 text-sm">Profesionales a tu alcance</Text>
              </View>

              {/* Form Title */}
              <Text className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-center text-xl font-bold mb-6`}>
                Inicia sesión
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>Email</Text>
                <TextInput
                  className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-4 text-base ${isDark ? 'text-white' : 'text-black'}`}
                  placeholder="Tu email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-700'} text-sm mb-2`}>Password</Text>
                <TextInput
                  className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl px-4 py-4 text-base ${isDark ? 'text-white' : 'text-black'}`}
                  placeholder="Tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="mb-6">
                <Text className={`${isDark ? 'text-blue-300' : 'text-blue-500'} text-right text-sm`}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                className="bg-blue-500 rounded-full py-4 mb-6 shadow-md"
              >
                <Text className="text-white text-center font-bold text-lg">
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}