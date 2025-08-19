import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createService(
    serviceData: {
    service_name: string;
    category: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    tipo: string[];
  },
  images: string[] // URIs de las imágenes
): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('token');
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
      formData.append(key, 
        key === 'tipo' 
          ? JSON.stringify(serviceData[key]) // Array a string
          : serviceData[key] //aqui sale una advertencia de typescript
      );
    });

    // 3. Enviar petición
    const response = await api.post('/service/post', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;

  } catch (error) {
    console.error('Error en createService:', error);
    throw error;
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
      return response.data
    }

    // Si todo sale bien, no necesitamos retornar nada (void)
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      console.error('Error en getUserServices:', error.message);
      
      // Relanzamos el error para que el componente que llama pueda manejarlo
      throw error;
    } else {
      // Para errores que no son instancias de Error
      console.error('Error desconocido en getUserServices:', error);
      throw new Error('Ocurrió un error desconocido al obtener servicios');
    }
  }
}

// Eliminar un servicio por ID
export async function deleteService(service_id: string) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    const response = await api.delete(`/service/delete/${service_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si la API responde éxito (200 o 204), retornamos true
    if (response.status === 200 || response.status === 204) {
      return true;
    }

    throw new Error('No se pudo eliminar el servicio');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error en deleteService:', error.message);
      throw error;
    } else {
      console.error('Error desconocido en deleteService:', error);
      throw new Error('Ocurrió un error desconocido al eliminar el servicio');
    }
  }
}
