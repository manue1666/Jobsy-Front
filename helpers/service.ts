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