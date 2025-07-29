import React, { useState, useEffect } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/favoritos/searchBar';
import { FeedHeader } from '@/components/mainComponents/principal/header';
import { ContentFilter } from '@/components/mainComponents/principal/contentFilter';
import { ServiceFeedCard } from '@/components/mainComponents/principal/ServiceFeedCard';

interface ServicePost {
  id: string;
  title: string;
  distance: string;
  personName: string;
  profilePic: string;
  serviceImages: string[];
  description: string;
  isFavorite: boolean;
  type: 'oficio' | 'empresa';
  isAd?: boolean;
  adUrl?: string;
}

export default function MainFeedScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'oficio' | 'empresa'>('oficio');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<ServicePost[]>([
    // Ad example - Burger King
    {
      id: 'ad-1',
      title: 'GRANDES PROPUESTAS',
      distance: 'Patrocinado',
      personName: 'Burger King',
      profilePic: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop',
      serviceImages: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'
      ],
      description: 'COMBO DELUXE CHEDDAR por solo $22. Las mejores hamburguesas al mejor precio. ¡Ordena ahora!',
      isFavorite: false,
      type: 'oficio',
      isAd: true,
      adUrl: 'https://www.burgerking.com.mx'
    },
    {
      id: '1',
      title: 'Electricista',
      distance: '5km',
      personName: 'David',
      profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      serviceImages: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
      ],
      description: 'Servicio profesional de electricidad para el hogar. Instalaciones, reparaciones y mantenimiento. 15 años de experiencia.',
      isFavorite: false,
      type: 'oficio'
    },
    {
      id: '2',
      title: 'Plomero',
      distance: '3km',
      personName: 'Carlos',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      serviceImages: [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop'
      ],
      description: 'Reparación de tuberías, instalación de sistemas de agua, destapado de drenajes. Servicio 24/7.',
      isFavorite: true,
      type: 'oficio'
    },
    {
      id: '3',
      title: 'Carpintero',
      distance: '7km',
      personName: 'José',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      serviceImages: [
        'https://images.unsplash.com/photo-1609781146681-52c351fb8054?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
      ],
      description: 'Muebles a medida, reparaciones en madera, puertas y ventanas. Trabajos garantizados.',
      isFavorite: false,
      type: 'empresa'
    }
  ]);

  const handleSearch = () => {
    console.log('Searching for:', searchText);
    // Implement search functionality here
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    setServices(prev =>
      prev.map(service =>
        service.id === id ? { ...service, isFavorite } : service
      )
    );
  };

  const handleContactPress = (serviceId: string) => {
    console.log('Contact service:', serviceId);
    // Navigate to contact screen or open contact options
  };

  const handleServicePress = (serviceId: string) => {
    console.log('View service details:', serviceId);
    // Navigate to service detail screen
  };

  const filteredServices = services.filter(service => {
    const matchesFilter = service.type === activeFilter;
    const matchesSearch = service.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         service.personName.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <ScreenContainer>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <FeedHeader
          userName="Gabriel"
          onProfilePress={() => console.log('Profile pressed')}
          onNotificationsPress={() => console.log('Notifications pressed')}
        />

        {/* Search Bar */}
        <SearchBar
          placeholder="Buscar servicios..."
          value={searchText}
          onChangeText={setSearchText}
          onSearchPress={handleSearch}
        />

        {/* Content Filter */}
        <ContentFilter
          onFilterChange={setActiveFilter}
        />

        {/* Service Feed */}
        <View className="pb-6">
          {filteredServices.map((service) => (
            <ServiceFeedCard
              key={service.id}
              id={service.id}
              title={service.title}
              distance={service.distance}
              personName={service.personName}
              profilePic={service.profilePic}
              serviceImages={service.serviceImages}
              description={service.description}
              isFavorite={service.isFavorite}
              isAd={service.isAd}
              adUrl={service.adUrl}
              onToggleFavorite={handleToggleFavorite}
              onPress={() => handleServicePress(service.id)}
              onContactPress={() => handleContactPress(service.id)}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}