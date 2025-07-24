import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { FormInput } from '@/components/authComponents/FormInput';
import * as Location from 'expo-location';

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  onLocationSelect
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu ubicación para autocompletar la dirección'
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      
      // Reverse geocoding to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const fullAddress = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        
        onChangeText(fullAddress);
        onLocationSelect?.({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: fullAddress
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <View className="relative">
      <FormInput
        label="Dirección"
        value={value}
        onChangeText={onChangeText}
        placeholder="Ingresa tu dirección"
        isRequired
        multiline
      />
      
      <TouchableOpacity
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
        className={`absolute right-3 p-2 rounded-full ${
          isDark ? 'bg-gray-600' : 'bg-gray-200'
        } ${isLoadingLocation ? 'opacity-50' : ''}`}
        style={{
          top: 28,
        }}
      >
        <Ionicons
          name={isLoadingLocation ? 'hourglass-outline' : 'location-outline'}
          size={20}
          color={isDark ? '#E5E7EB' : '#374151'}
        />
      </TouchableOpacity>
    </View>
  );
};