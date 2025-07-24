import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'react-native';

interface AppLogoProps {
  variant?: 'light' | 'dark' | 'colored';
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export function AppLogo({ variant, size = 'medium', showTagline = true }: AppLogoProps) {

  const getVariantStyles = () => {
    switch (variant) {
      case 'light':
        return {
          containerBg: 'bg-white',
          iconBg: 'bg-blue-500',
          iconText: 'text-white',
          titleText: 'text-white',
          taglineText: 'text-blue-100',
        };
      case 'dark':
        return {
          containerBg: 'bg-gray-800',
          iconBg: 'bg-blue-500',
          iconText: 'text-white',
          titleText: 'text-white',
          taglineText: 'text-gray-300',
        };
      case 'colored':
      default:
        return {
          containerBg: 'bg-blue-500',
          iconBg: 'bg-white',
          iconText: 'text-blue-500',
          titleText: 'text-blue-500',
          taglineText: 'text-gray-600',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2',
          icon: 'w-6 h-6',
          iconText: 'text-sm',
          title: 'text-lg',
          tagline: 'text-xs',
        };
      case 'large':
        return {
          container: 'p-4',
          icon: 'w-10 h-10',
          iconText: 'text-xl',
          title: 'text-3xl',
          tagline: 'text-base',
        };
      case 'medium':
      default:
        return {
          container: 'p-3',
          icon: 'w-8 h-8',
          iconText: 'text-lg',
          title: 'text-2xl',
          tagline: 'text-sm',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View className="items-center">
      <View className={`${variantStyles.containerBg} rounded-2xl ${sizeStyles.container} mb-4`}>
        <View className={`${sizeStyles.icon} ${variantStyles.iconBg} rounded-lg items-center justify-center`}>
          <Text className={`${variantStyles.iconText} font-bold ${sizeStyles.iconText}`}>J</Text>
        </View>
      </View>
      
      <Text className={`${variantStyles.titleText} ${sizeStyles.title} font-bold`}>Jobsy</Text>
      {showTagline && (
        <Text className={`${variantStyles.taglineText} ${sizeStyles.tagline}`}>
          Profesionales a tu alcance
        </Text>
      )}
    </View>
  );
}