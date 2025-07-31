import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Service {
  _id: string;
  service_name: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  service_location: {
    type: string;
    coordinates: number[];
  };
  photos: string[];
  tipo: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  isFavorite: boolean;
  user: {
    _id: string;
    name: string;
  };
}

interface SearchResponse {
  total: number;
  page: number;
  pages: number;
  services: Service[];
}

interface SearchParams {
  query?: string;      // Filtro por categoría
  page?: number;       // Número de página
  limit?: number;      // Items por página (opcional)
}

export const searchService = async (params?: SearchParams): Promise<SearchResponse> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No se encontró el token de autenticación');

    // Construir query params
    const queryParams = new URLSearchParams();
    
    if (params?.query) queryParams.append('query', params.query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/service/search?${queryParams.toString()}`;

    const response = await api.get<SearchResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Verificar la estructura básica de la respuesta
    if (!response.data || !Array.isArray(response.data.services)) {
      throw new Error('La respuesta del servidor no tiene el formato esperado');
    }

    return response.data;

  } catch (error: any) {
    console.error('Error en searchService:', error);
    
    // Manejo de errores de Axios
    if (error.isAxiosError) {
      if (!error.response) {
        throw new Error('Error de conexión con el servidor');
      }
      
      const serverMessage = error.response.data?.error || 
                          error.response.data?.message ||
                          `Error del servidor: ${error.response.status}`;
      
      throw new Error(serverMessage);
    }
    
    // Relanzar otros errores
    throw error instanceof Error ? error : new Error('Error desconocido al buscar servicios');
  }
};