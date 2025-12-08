import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeocodeError {
  error: string;
  message: string;
  suggestions?: string[];
  field?: string;
  detectedAddress?: string;
}

export async function createService(
  serviceData: {
    service_name: string;
    category: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    latitude?: number | null;   
    longitude?: number | null;  
    tipo: string[];
  },
  images: string[] // URIs de las imágenes
): Promise<any> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    const formData = new FormData();

    // 1. Agregar imágenes al FormData
    images.forEach((uri, index) => {
      formData.append('serviceImages', {
        uri,
        type: 'image/jpeg',
        name: `service-${Date.now()}-${index}.jpg`
      } as any);
    });

    // 2. Agregar otros campos
    Object.keys(serviceData).forEach(key => {
      const value = serviceData[key as keyof typeof serviceData];
      
      // Solo agregar campos con valores válidos
      if (value !== null && value !== undefined) {
        formData.append(
          key,
          key === 'tipo'
            ? JSON.stringify(value) // Array a string
            : String(value) // Convertir explícitamente a string
        );
      }
    });

    console.log('[CreateService] Enviando servicio:', {
      address: serviceData.address,
      hasCoordinates: !!(serviceData.latitude && serviceData.longitude),
      latitude: serviceData.latitude,
      longitude: serviceData.longitude,
    });

    // 3. Enviar petición
    const response = await api.post('/service/post', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 201 && response.data) {
      console.log('[CreateService] Servicio creado exitosamente');
      
      // Mostrar información de geocodificación si está disponible
      if (response.data.geocodeInfo) {
        console.log('[CreateService] Dirección normalizada:', response.data.geocodeInfo.normalizedAddress);
        console.log('[CreateService] Confianza:', response.data.geocodeInfo.confidence);
      }
      
      return response.data;
    }

    throw new Error('Respuesta inválida del servidor');

  } catch (error: any) {
    console.error('[CreateService] Error:', error?.response?.status, error?.message);

    // Manejar errores de geocodificación específicamente
    if (error?.response?.status === 400 && error?.response?.data?.field === 'address') {
      const geocodeError: GeocodeError = error.response.data;
      
      // Crear mensaje de error detallado con sugerencias
      let errorMessage = geocodeError.message;
      
      if (geocodeError.suggestions && geocodeError.suggestions.length > 0) {
        errorMessage += '\n\nSugerencias:\n' + geocodeError.suggestions.map(s => `• ${s}`).join('\n');
      }
      
      if (geocodeError.detectedAddress) {
        errorMessage += `\n\nDirección detectada: ${geocodeError.detectedAddress}`;
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = geocodeError.error;
      (enhancedError as any).suggestions = geocodeError.suggestions;
      (enhancedError as any).detectedAddress = geocodeError.detectedAddress;
      throw enhancedError;
    }

    // Manejar error de límite de servicios (usuarios no premium)
    if (error?.response?.status === 403) {
      throw new Error(error?.response?.data?.error || 'No tienes permiso para crear más servicios');
    }

    // Manejar error de teléfono duplicado
    if (error?.response?.status === 409) {
      throw new Error(error?.response?.data?.error || 'El teléfono ya está registrado');
    }

    // Manejar error de imágenes
    if (error?.response?.data?.field === 'images') {
      throw new Error(error?.response?.data?.message || 'Error al procesar las imágenes');
    }

    // Error genérico
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'No se pudo crear el servicio. Intenta de nuevo'
    );
  }
}

//Obtener servicios publicados por el usuario
export async function getUserServices() {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Llamada a la API usando get
    const response = await api.get('/service/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // si la respuesta indica éxito
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw new Error('Respuesta inválida del servidor');
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      console.error('Error en getUserServices:', error.message);
      throw error;
    } else {
      console.error('Error desconocido en getUserServices:', error);
      throw new Error('Ocurrió un error desconocido al obtener servicios');
    }
  }
}

// Actualizar un servicio por ID
export async function updateService(service_id: string, serviceData: Record<string, any>) {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No se encontró el token de autenticación");

    const formData = new FormData();

    serviceData.photos.forEach((img: string, index: number) => {
      if (img.startsWith("file://")) {
        // Nuevas imágenes locales
        formData.append("serviceImages", {
          uri: img,
          type: "image/jpeg",
          name: `image_${index}.jpg`,
        } as any);
      }
    });

    // Enviar las URLs existentes en un solo campo JSON
    const existingUrls = serviceData.photos.filter((img: string) => !img.startsWith("file://"));
    formData.append("existingPhotos", JSON.stringify(existingUrls));

    // Agregar otros campos (incluyendo 'tipo', 'latitude', 'longitude')
    Object.keys(serviceData).forEach((key) => {
      if (key !== 'photos') { // Ya procesamos photos arriba
        const value = serviceData[key];
        
        // Solo agregar si tiene valor
        if (value !== null && value !== undefined) {
          formData.append(
            key,
            key === "tipo"
              ? JSON.stringify(value)
              : String(value)
          );
        }
      }
    });

    console.log('[UpdateService] Actualizando servicio:', service_id, {
      hasCoordinates: !!(serviceData.latitude && serviceData.longitude),
    });

    // llamada al backend
    const response = await api.patch(`/service/patch/${service_id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      console.log('[UpdateService] Servicio actualizado exitosamente');
      return response.data.service;
    }

    throw new Error("No se pudo actualizar el servicio");
  } catch (error: any) {
    console.error('[UpdateService] Error:', error?.response?.status, error?.message);

    // Manejar errores de geocodificación en actualización
    if (error?.response?.status === 400 && error?.response?.data?.field === 'address') {
      const geocodeError: GeocodeError = error.response.data;
      
      let errorMessage = geocodeError.message;
      if (geocodeError.suggestions && geocodeError.suggestions.length > 0) {
        errorMessage += '\n\nSugerencias:\n' + geocodeError.suggestions.map(s => `• ${s}`).join('\n');
      }
      
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = geocodeError.error;
      (enhancedError as any).suggestions = geocodeError.suggestions;
      throw enhancedError;
    }

    if (error instanceof Error) {
      throw error;
    } else {
      console.error("Error desconocido en updateService:", error);
      throw new Error("Ocurrió un error desconocido al actualizar el servicio");
    }
  }
}

// Eliminar un servicio por ID
export async function deleteService(service_id: string) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    console.log('[DeleteService] Eliminando servicio:', service_id);

    const response = await api.delete(`/service/delete/${service_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si la API responde éxito (200 o 204), retornamos true
    if (response.status === 200 || response.status === 204) {
      console.log('[DeleteService] Servicio eliminado exitosamente');
      return true;
    }

    throw new Error('No se pudo eliminar el servicio');
  } catch (error: any) {
    console.error('[DeleteService] Error:', error?.response?.status, error?.message);

    if (error instanceof Error) {
      throw error;
    } else {
      console.error('Error desconocido en deleteService:', error);
      throw new Error('Ocurrió un error desconocido al eliminar el servicio');
    }
  }
}
