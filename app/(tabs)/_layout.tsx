import React from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

import { TabBarIcon } from "@/components/IconFontAwesome";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconSize = 25;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
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
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} size={iconSize}/>,
        }}
      />

	  <Tabs.Screen
	   name="publicar"
	   options={{
		 title: "Publicar",
		 tabBarIcon: ({ color }) => <TabBarIcon name="pencil-square" color={color} size={iconSize}/>,
	   }}
	  />

	  <Tabs.Screen
	   name="perfil"
	   options={{
		 title: "Perfil",
		 tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} size={iconSize}/>
	   }}
	   />

	  <Tabs.Screen
	   name="opciones"
	   options={{
		 title: "Opciones",
		 tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} size={iconSize}/>
	   }}
	   />

    </Tabs>
  );
}
