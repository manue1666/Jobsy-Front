// helpers/location.ts
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const getUserLocation = async () => {
  try {
    // 1. Pedir permisos
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos','Necesitamos acceso a tu ubicación para mostrar servicios cercanos',[
        {
          text : 'OK'
        }
        ], {
        cancelable : true
        });
      return null;
    }

    // 2. Obtener ubicación
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    Alert.alert('Error','No se pudo obtener tu ubicación',[
      {
        text : 'OK'
      }
      ], {
      cancelable : true
      });
    return null;
  }
};