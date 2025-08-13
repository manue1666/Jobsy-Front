import { Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { router, Stack } from "expo-router";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ThemeContext } from '@/context/themeContext';
import ThemeButton from "@/components/mainComponents/opciones/themeButton";


export default function ChangeThemeScreen() {
    const { currentTheme, toggleTheme, useSysTheme, isSystemTheme } = useContext(ThemeContext);
    const isDark = currentTheme === "dark";
    return (
        <ScreenContainer androidSafeArea={false}>
            <Stack.Screen
                name="ChageTheme"
                options={{
                    title: 'Cambiar tema',
                    headerStyle: { backgroundColor: isDark ? "#111823" : "#ffffff" }, // Cambia el fondo del header
                    headerTintColor: isDark ? "#ffffff" : "#000000", // Cambia el color del texto y flecha
                }}
            />
            <ThemeButton
                title='Claro' icon='lightbulb-on' onPress={() => { toggleTheme('light') }} isActive={!isSystemTheme && currentTheme === 'light'}
            />
            <ThemeButton
                title='Oscuro' icon='weather-night' onPress={() => { toggleTheme('dark') }} isActive={!isSystemTheme && currentTheme === 'dark'}
            />
            <ThemeButton
                title='Sistema' icon='theme-light-dark' onPress={useSysTheme} isActive={isSystemTheme}
            />
        </ScreenContainer>
    )
}