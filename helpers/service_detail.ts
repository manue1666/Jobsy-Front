import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definición de tipos para el servicio
export interface ServiceLocation {
  type: string;
  coordinates: number[];
}

export interface Service {
  _id: string;
  user_id: string;
  service_name: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  service_location: ServiceLocation;
  photos: string[];
  tipo: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ApiResponse {
  service: Service;
}

export const getServiceById = async (serviceId: string): Promise<Service> => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await api.get<ApiResponse>(`/service/get/${serviceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.service;

  } catch (error: any) {
    const message = error.response?.data?.error || 'Error al obtener el servicio';
    throw new Error(message);
  }
};