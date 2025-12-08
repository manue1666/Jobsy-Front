import { ThemeContext } from '@/context/themeContext';
import { Tabs } from 'expo-router';
import { useContext } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const {currentTheme} = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicia Sesión',
          tabBarIcon: ({ color }) => (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color === '#3B82F6' ? '#3B82F6' : (isDark ? '#6B7280' : '#D1D5DB'),
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}>
              <Text style={{ color: color === '#3B82F6' ? 'white' : (isDark ? 'white' : '#6B7280'), fontSize: 12 }}>👤</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: 'Registrate',
          tabBarIcon: ({ color }) => (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color === '#3B82F6' ? '#3B82F6' : (isDark ? '#6B7280' : '#D1D5DB'),
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}>
              <Text style={{ color: color === '#3B82F6' ? 'white' : (isDark ? 'white' : '#6B7280'), fontSize: 12 }}>👥</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}