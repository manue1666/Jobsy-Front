import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export function PrimaryButton({ 
  title, 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  disabled,
  ...touchableOpacityProps 
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: `bg-gray-500 ${isDisabled ? 'opacity-50' : ''}`,
          text: 'text-white',
        };
      case 'outline':
        return {
          button: `border-2 border-blue-500 bg-transparent ${isDisabled ? 'opacity-50' : ''}`,
          text: 'text-blue-500',
        };
      case 'primary':
      default:
        return {
          button: `bg-blue-500 ${isDisabled ? 'opacity-50' : ''}`,
          text: 'text-white',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          button: 'py-2 px-4',
          text: 'text-sm',
        };
      case 'large':
        return {
          button: 'py-5 px-8',
          text: 'text-xl',
        };
      case 'medium':
      default:
        return {
          button: 'py-4 px-6',
          text: 'text-lg',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      className={`${variantStyles.button} ${sizeStyles.button} rounded-full shadow-md`}
      disabled={isDisabled}
      {...touchableOpacityProps}
    >
      <Text className={`${variantStyles.text} ${sizeStyles.text} text-center font-bold`}>
        {loading ? 'Cargando...' : title}
      </Text>
    </TouchableOpacity>
  );
}