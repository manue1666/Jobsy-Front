import { useState, useCallback } from "react";
import { searchService } from '@/helpers/search_service';
import { addFavorite, removeFavorite } from '@/helpers/favorites';
import { useAlert } from "@/components/mainComponents/Alerts";
import { FilterState } from "@/components/mainComponents/principal/FilterPanel";

const defaultServiceImage = "@/assets/images/service_default_image.png";

export interface ServicePost {
  id: string;
  title: string;
  address: string;
  category: string;
  personName: string;
  serviceImages: string[];
  description: string;
  isFavorite: boolean;
  favoritesCount?: number;
  isPromoted?: boolean;
  profilePhoto?: string;
  distance?: number; // NUEVO: distancia en metros
  user?: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  user_id?: any;
}

export function useServices() {
  const [searchText, setSearchText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<ServicePost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    nearbyEnabled: false,
    maxDistance: 10000,
  });
  const { errAlert } = useAlert();

  const transformServiceData = useCallback(
    (apiServices: any[]): ServicePost[] => {
      return apiServices.map((service) => {
        const resolvedUser = service.user || service.user_id || {};
        return {
          id: service._id,
          title: service.service_name,
          address: service.address || "Dirección no disponible",
          category: service.category,
          personName: resolvedUser?.name || "Anónimo",
          serviceImages:
            service.photos?.length > 0
              ? service.photos
              : [defaultServiceImage],
          description: service.description,
          isFavorite: service.isFavorite || false,
          favoritesCount: service.favoritesCount || 0,
          isPromoted: service.isPromoted || false,
          distance: service.distance, // NUEVO
          profilePhoto: resolvedUser?.profilePhoto,
          user: service.user
            ? {
                _id: service.user._id,
                name: service.user.name,
                profilePhoto: service.user.profilePhoto,
              }
            : undefined,
          user_id: service.user_id,
        };
      });
    },
    []
  );

  const fetchServices = useCallback(
    async (pageNum = 1, currentFilters?: FilterState) => {
      try {
        setLoading(true);
        const filtersToUse = currentFilters || filters;

        const params: any = {
          page: pageNum,
          limit: 10,
        };

        // Agregar texto de búsqueda
        if (filtersToUse.searchText) {
          params.query = filtersToUse.searchText;
        }

        // Agregar geolocalización si está activada
        if (filtersToUse.nearbyEnabled && filtersToUse.latitude && filtersToUse.longitude) {
          params.latitude = filtersToUse.latitude;
          params.longitude = filtersToUse.longitude;
          params.maxDistance = filtersToUse.maxDistance;
        }

        // Agregar categoría si existe
        if (filtersToUse.category) {
          params.category = filtersToUse.category;
        }

        // Agregar ordenamiento si existe
        if (filtersToUse.sortBy) {
          params.sortBy = filtersToUse.sortBy;
        }

        const result = await searchService(params);

        setServices((prev) =>
          pageNum === 1
            ? transformServiceData(result.services)
            : [...prev, ...transformServiceData(result.services)]
        );
        setTotalPages(result.pages);
        setPage(pageNum);

        if (!result.services || result.services.length === 0) {
          errAlert("Info", "No se encontraron servicios con estos filtros");
        }
      } catch (error: any) {
        errAlert("Error", error.message || "No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [transformServiceData, filters]
  );

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setSearchText(newFilters.searchText);
    fetchServices(1, newFilters);
  }, [fetchServices]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.nearbyEnabled) count++;
    if (filters.category) count++;
    if (filters.searchText) count++;
    return count;
  }, [filters]);

  const handleToggleFavorite = useCallback(
    async (serviceId: string, isCurrentlyFavorite: boolean) => {
      try {
        if (isCurrentlyFavorite) {
          await removeFavorite(serviceId);
        } else {
          await addFavorite(serviceId);
        }
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === serviceId
              ? { ...service, isFavorite: !isCurrentlyFavorite }
              : service
          )
        );
      } catch (error: any) {
        console.error("Error al actualizar favorito:", error);
        errAlert("Error", error.message || "No se pudo actualizar el favorito");
      }
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchServices(page + 1);
    }
  }, [page, totalPages, loading, fetchServices]);

  return {
    searchText,
    setSearchText,
    isRefreshing,
    setIsRefreshing,
    services,
    page,
    totalPages,
    loading,
    filters,
    fetchServices,
    handleToggleFavorite,
    handleApplyFilters,
    handleLoadMore,
    getActiveFiltersCount,
  };
}
