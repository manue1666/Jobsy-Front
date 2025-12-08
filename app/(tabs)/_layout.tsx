import React, { useContext } from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { TabBarIcon } from "@/components/authComponents/IconFontAwesome";
import { ThemeContext } from '@/context/themeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === "dark";
  const iconSize = 25;
  const themeColors = Colors[currentTheme as keyof typeof Colors];
  const insets = useSafeAreaInsets(); // ← NUEVO

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          // Altura dinámica que incluye el safe area bottom
          height: 60 + insets.bottom, // altura base + inset inferior
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // respeta inset
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
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} size={27} />,
        }}
      />

      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} size={iconSize} />,
        }}
      />

      <Tabs.Screen
        name="publicar"
        options={{
          title: "Publicar",
          tabBarIcon: ({ color }) => <TabBarIcon name="pencil-square" color={color} size={iconSize} />,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} size={iconSize} />
        }}
      />

      <Tabs.Screen
        name="opciones"
        options={{
          title: "Opciones",
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} size={iconSize} />
        }}
      />
    </Tabs>
  );
}
