import { createContext, ReactNode, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

export type ThemeContextType = {
    isSystemTheme: boolean,
    currentTheme: string;
    toggleTheme: (newTheme: string) => void;
    useSysTheme: () => void,
}

export const ThemeContext = createContext<ThemeContextType>({
    isSystemTheme: false,
    currentTheme: 'light',
    toggleTheme: () => { },
    useSysTheme: () => { },
});

//Este componente envuelve a toda la app en _layout
const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorScheme = useColorScheme();
    const [theme, setTheme] = useState<string>('light');
    const [systemTheme, setSystemTheme] = useState<boolean>(false);

    //cargar el tema guardado en AsyncStorage
    useEffect(() => {
        const getTheme = async () => {
            try {
                const savedThemeObject = await AsyncStorage.getItem('theme');
                const savedThemeObjectData = JSON.parse(savedThemeObject!);

                if (savedThemeObjectData) {
                    setTheme(savedThemeObjectData.mode);
                    setSystemTheme(savedThemeObjectData.system);
                }
            } catch (error) {
                console.log('Error al cargar el tema', error);
            }
        }

        getTheme();
    }, []);

    useEffect(() => {
        if (colorScheme && systemTheme) {
            const themeObject = {
                mode: colorScheme,
                system: true
            }
            setTheme(colorScheme);
            setSystemTheme(true);
            AsyncStorage.setItem('theme', JSON.stringify(themeObject)); //guardar el tema activo en AsyncStorage
        }
    }, [colorScheme])

    const toggleTheme = (newTheme: string) => {
        const themeObject = {
            mode: newTheme,
            system: false
        }
        setTheme(newTheme);
        setSystemTheme(false);
        AsyncStorage.setItem('theme', JSON.stringify(themeObject)); //guardar el tema activo en AsyncStorage
    }

    const useSysTheme = () => {
        if (colorScheme) {
            const themeObject = {
                mode: colorScheme,
                system: true
            }
            setTheme(colorScheme);
            setSystemTheme(true);
            AsyncStorage.setItem('theme', JSON.stringify(themeObject)); //guardar el tema activo en AsyncStorage
        }
    }

    return (
        <ThemeContext.Provider value={{ isSystemTheme: systemTheme, currentTheme: theme, toggleTheme, useSysTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;