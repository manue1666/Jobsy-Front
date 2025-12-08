import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormInput } from '@/components/authComponents/FormInput';
import * as Location from 'expo-location';
import { ThemeContext } from '@/context/themeContext';

interface LocationData {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface LocationInputProps {
  value: string;
  coordinates?: { latitude: number | null; longitude: number | null };
  onChangeText: (text: string) => void;
  onLocationSelect?: (location: LocationData) => void;
  error?: string;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  coordinates,
  onChangeText,
  onLocationSelect,
  error
}) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [validationError, setValidationError] = useState<string>('');
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  // Validar dirección escrita manualmente
  const validateManualAddress = async (address: string) => {
    // No validar si está vacío o muy corto
    if (!address || address.trim().length < 10) {
      setValidationState('idle');
      setValidationError('');
      return;
    }

    try {
      setValidationState('validating');
      setValidationError('');

      console.log('[LocationInput] Validando dirección:', address);

      // Usar geocoding de Expo para validar
      const geocoded = await Location.geocodeAsync(address);

      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        
        console.log('[LocationInput] Dirección validada:', { latitude, longitude });

        // Actualizar con coordenadas validadas
        onLocationSelect?.({
          address: address,
          latitude,
          longitude,
        });

        setValidationState('valid');
      } else {
        console.log('[LocationInput] ⚠️ No se encontraron coordenadas para:', address);
        
        setValidationState('invalid');
        setValidationError('No se pudo verificar la dirección. Intenta ser más específico o usa GPS.');
        
        // Limpiar coordenadas
        onLocationSelect?.({
          address: address,
          latitude: null,
          longitude: null,
        });
      }
    } catch (error) {
      console.error('[LocationInput] Error al validar dirección:', error);
      
      setValidationState('invalid');
      setValidationError('Error al verificar la dirección. Verifica tu conexión.');
      
      // Limpiar coordenadas
      onLocationSelect?.({
        address: address,
        latitude: null,
        longitude: null,
      });
    }
  };

  // Obtener ubicación actual con GPS
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu ubicación para autocompletar la dirección'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      // Reverse geocoding para obtener dirección
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const fullAddress = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        
        onChangeText(fullAddress);
        
        onLocationSelect?.({
          address: fullAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setValidationState('valid');
        setValidationError('');
        
        console.log('[LocationInput] Ubicación GPS obtenida:', {
          address: fullAddress,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
      console.error('[LocationInput] Error GPS:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Manejar input manual
  const handleManualInput = (text: string) => {
    onChangeText(text);
    
    // Resetear estado de validación mientras escribe
    if (validationState !== 'idle') {
      setValidationState('idle');
      setValidationError('');
    }
    
    // Limpiar coordenadas mientras edita
    onLocationSelect?.({
      address: text,
      latitude: null,
      longitude: null,
    });
  };

  // Validar cuando pierde el foco
  const handleBlur = () => {
    if (value && value.trim().length >= 10 && !coordinates?.latitude) {
      validateManualAddress(value);
    }
  };

  return (
    <View className="relative">
      <FormInput
        label="Dirección"
        value={value}
        onChangeText={handleManualInput}
        onBlur={handleBlur}
        placeholder="Dirección completa (Calle, número, colonia, ciudad, estado)"
        isRequired
        multiline
      />
      
      {/* Botón de GPS */}
      <TouchableOpacity
        onPress={getCurrentLocation}
        disabled={isLoadingLocation || validationState === 'validating'}
        className={`absolute right-3 p-2 rounded-full ${
          isDark ? 'bg-gray-600' : 'bg-gray-200'
        } ${isLoadingLocation ? 'opacity-50' : ''}`}
        style={{ top: 28 }}
      >
        <Ionicons
          name={isLoadingLocation ? 'hourglass-outline' : 'location-outline'}
          size={20}
          color={isDark ? '#E5E7EB' : '#374151'}
        />
      </TouchableOpacity>

      {/* Estado de validación */}
      {validationState === 'validating' && (
        <View className={`mt-2 flex-row items-center ${
          isDark ? 'bg-blue-900/20' : 'bg-blue-50'
        } p-3 rounded-lg`}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className={`ml-2 text-sm ${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            Verificando dirección...
          </Text>
        </View>
      )}

      {/* Dirección válida */}
      {validationState === 'valid' && coordinates?.latitude && coordinates?.longitude && (
        <View className={`mt-2 ${
          isDark ? 'bg-green-900/20' : 'bg-green-50'
        } p-3 rounded-lg`}>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text className={`ml-2 text-sm font-medium ${
              isDark ? 'text-green-300' : 'text-green-700'
            }`}>
              ✓ Dirección verificada
            </Text>
          </View>
          <Text className={`mt-1 text-xs ${
            isDark ? 'text-green-400/70' : 'text-green-600/70'
          }`}>
            📍 {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Dirección inválida */}
      {validationState === 'invalid' && (
        <View className={`mt-2 ${
          isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
        } p-3 rounded-lg`}>
          <View className="flex-row items-center">
            <Ionicons name="warning" size={18} color="#f59e0b" />
            <Text className={`ml-2 text-sm font-medium ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              No se pudo verificar la dirección
            </Text>
          </View>
          <Text className={`mt-1 text-xs ${
            isDark ? 'text-yellow-400/70' : 'text-yellow-600/70'
          }`}>
            {validationError}
          </Text>
          <TouchableOpacity
            onPress={getCurrentLocation}
            className={`mt-2 flex-row items-center self-start px-3 py-1.5 rounded-full ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <Ionicons name="locate" size={14} color={isDark ? '#E5E7EB' : '#374151'} />
            <Text className={`ml-1 text-xs ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Usar GPS en su lugar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error externo (del formulario) */}
      {error && (
        <Text className="mt-1 text-red-500 text-sm">{error}</Text>
      )}
    </View>
  );
};