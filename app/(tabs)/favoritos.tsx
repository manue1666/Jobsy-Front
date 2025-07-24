import React, { useState } from 'react';
import { ScrollView, View, useColorScheme } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/mainComponents/searchBar';
import { FavoriteCard } from '@/components/mainComponents/favoritosCard';

interface FavoriteItem {
  id: string;
  title: string;
  distance: string;
  personName: string;
  profilePic: string;
  isFavorite: boolean;
}

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: '1',
      title: 'Electricista',
      distance: '5km',
      personName: 'David',
      profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Plomero',
      distance: '5km',
      personName: 'Sergio',
      profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isFavorite: true,
    },
    {
      id: '3',
      title: 'Carpintero',
      distance: '5km',
      personName: 'Jose',
      profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isFavorite: true,
    },
    {
      id: '4',
      title: 'Albañil',
      distance: '5km',
      personName: 'Juan',
      profilePic: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
      isFavorite: true,
    },
  ]);

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    setFavorites(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite } : item
      )
    );
  };

  const handleSearch = () => {
    // Implement search functionality here
    console.log('Searching for:', searchText);
  };

  const filteredFavorites = favorites.filter(item =>
    item.isFavorite && 
    (item.title.toLowerCase().includes(searchText.toLowerCase()) ||
     item.personName.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <ScreenContainer>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <SearchBar
          placeholder="Buscar favoritos..."
          value={searchText}
          onChangeText={setSearchText}
          onSearchPress={handleSearch}
        />
        
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredFavorites.map((item) => (
            <FavoriteCard
              key={item.id}
              id={item.id}
              title={item.title}
              distance={item.distance}
              personName={item.personName}
              profilePic={item.profilePic}
              isFavorite={item.isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onPress={() => console.log('Card pressed:', item.title)}
            />
          ))}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}