import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Text, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/themeContext';

interface OwnedServiceCardProps {
    id: string;
    title: string;
    personName: string;
    profilePic: string;
    onPress?: () => void;
}

export const OwnedServiceCard: React.FC<OwnedServiceCardProps> = ({
    id,
    title,
    personName,
    profilePic,
    onPress
}) => {
    const {currentTheme} = useContext(ThemeContext);
    const isDark = currentTheme === 'dark';

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`rounded-2xl mx-4 mb-3 p-4 shadow-sm ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-100'
                }`}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <Ionicons
                        name="pencil"
                        size={24}
                        color={(isDark ? "#9CA3AF" : "#9CA3AF")}
                    />
                    <View className="flex-1 ml-2">
                        <View className="flex-row items-center mb-1">
                            <Text className={`text-lg font-semibold mr-2 ${isDark ? 'text-gray-100' : 'text-gray-900'
                                }`}>
                                {title}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <Text className={`font-medium mr-3 ${isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                        {personName}
                    </Text>
                    <Image
                        source={{ uri: profilePic }}
                        className="w-10 h-10 rounded-full"
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};