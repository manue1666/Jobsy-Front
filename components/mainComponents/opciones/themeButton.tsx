import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ThemeContext } from '@/context/themeContext';

type ThemeButtonProps = {
    title: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    onPress: () => void;
    isActive: boolean;
}

const ThemeButton = ({title, icon, onPress, isActive}: ThemeButtonProps) => {
const {currentTheme} = useContext(ThemeContext);
const isDark = currentTheme === "dark";
const cardBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100';

    return (
        <TouchableOpacity className={`flex-row justify-between p-4 mt-5 rounded-3xl shadow-sm ${cardBg}`} onPress={onPress}>
            <View style={styles.titleWrapper}>
                <MaterialCommunityIcons
                    name={icon}
                    size={20}
                    color={isDark ? "#ffffff" : "#000000"}
                />
                <Text style={[styles.title, {color: isDark ? "#ffffff" : "#000000"}]}>{title}</Text>
            </View>
            <MaterialCommunityIcons
                name={isActive ? "check-circle" : "checkbox-blank-circle-outline"}
                size={20}
                color= {isActive ? "#006dff" : isDark? "#ffffff" : "#000000"}
            />
        </TouchableOpacity>
    )
}

export default ThemeButton

const styles = StyleSheet.create({
    settingButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: "#fffff",
        padding: 20,
        borderRadius: 10,
        marginBottom: 15
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    title: {
        fontSize: 14,
        fontWeight: '500'
    }
})