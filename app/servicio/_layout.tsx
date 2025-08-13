import { View } from '@/components/Themed';
import { ThemeContext } from '@/context/themeContext';
import { Slot, Stack } from 'expo-router';
import { useContext } from 'react';

export default function Layout() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Stack.Screen
        name="serviceDetails"
        options={{
          title: 'Detalles del servicio',
          headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" }, // Cambia el fondo del header
          headerTintColor: isDark ? "#ffffff" : "#000000", // Cambia el color del texto y flecha
        }}
      />
      <Slot />
    </View>
  );
}