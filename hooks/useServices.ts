import { useState, useCallback } from "react";
import { getNearbyServices, searchService } from '@/helpers/search_service';
import { addFavorite, removeFavorite } from '@/helpers/favorites';
import { getUserLocation } from '@/helpers/location';
import { useSearchRange } from "@/context/searchRangeContext";
import { useAlert } from "@/components/mainComponents/Alerts";

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
  const [locationLoading, setLocationLoading] = useState(false);
  const { searchRange } = useSearchRange();
  const { okAlert, errAlert } = useAlert();

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
    async (pageNum = 1, searchQuery = "") => {
      try {
        setLoading(true);
        const result = await searchService({
          query: searchQuery,
          page: pageNum,
          limit: 10,
        });
        setServices((prev) =>
          pageNum === 1
            ? transformServiceData(result.services)
            : [...prev, ...transformServiceData(result.services)]
        );
        setTotalPages(result.pages);
        setPage(pageNum);

        if(!result.services || result.services.length===0){
          errAlert("Error","No se encontraron servicios.");
        }

      } catch (error: any) {
        errAlert("Error", error.message || "No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [transformServiceData]
  );

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

  const handleNearbyPress = useCallback(async () => {
    try {
      setLocationLoading(true);
      const coords = await getUserLocation();
      if (!coords) return;
      const nearbyServices = await getNearbyServices(coords, searchRange);
      setServices(transformServiceData(nearbyServices));
    } catch (error: any) {
      errAlert(
        "Error",
        error.message ||
          "No se pudieron cargar los servicios cercanos, inténtelo más nuevamente"
      );
      console.error(error);
    } finally {
      setLocationLoading(false);
    }
  }, [transformServiceData, searchRange]);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      fetchServices(page + 1, searchText);
    }
  }, [page, totalPages, loading, searchText, fetchServices]);

  return {
    searchText,
    setSearchText,
    isRefreshing,
    setIsRefreshing,
    services,
    setServices,
    page,
    setPage,
    totalPages,
    setTotalPages,
    loading,
    setLoading,
    locationLoading,
    setLocationLoading,
    fetchServices,
    handleToggleFavorite,
    handleNearbyPress,
    handleLoadMore,
  };
}
