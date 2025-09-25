import React from "react";
import { View, ActivityIndicator } from "react-native";
import { ServiceFeedCard } from '@/components/mainComponents/principal/ServiceFeedCard';
import { ServicePost } from "./useServices";

interface ServiceListProps {
  services: ServicePost[];
  loading: boolean;
  page: number;
  onToggleFavorite: (serviceId: string, isCurrentlyFavorite: boolean) => void;
  onPress: (service: ServicePost) => void; // pasamos el objeto completo para poder enviar fallback de nombre
}

export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading,
  page,
  onToggleFavorite,
  onPress,
}) => (
  <View className="pb-6">
    {services.map((service) => (
      <ServiceFeedCard
        key={service.id}
        id={service.id}
        title={service.title}
        address={service.address}
        category={service.category}
        personName={service.personName}
        serviceImages={service.serviceImages}
        description={service.description}
        isFavorite={service.isFavorite}
        favoritesCount={service.favoritesCount}
        isPromoted={service.isPromoted}
        onToggleFavorite={() => onToggleFavorite(service.id, service.isFavorite)}
        onPress={() => onPress(service)}
      />
    ))}
    {loading && page > 1 && (
      <View className="py-4">
        <ActivityIndicator size="small" />
      </View>
    )}
  </View>
);
