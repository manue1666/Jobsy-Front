import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/themeContext';
import { getUserLocation } from '@/helpers/location';
import { CATEGORIES } from '@/constants/Categories';

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  searchText: string;
  nearbyEnabled: boolean;
  maxDistance: number;
  category?: string;
  sortBy?: 'distance' | 'createdAt' | 'favorites'; // ← REMOVIDO 'promoted'
  latitude?: number;
  longitude?: number;
}

// Componente Slider Simple personalizado
const SimpleSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  isDark: boolean;
}> = ({ value, onValueChange, minimumValue, maximumValue, step, isDark }) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const position = new Animated.Value(
    ((value - minimumValue) / (maximumValue - minimumValue)) * sliderWidth
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 20));
      const percentage = newPosition / sliderWidth;
      const newValue = Math.round(
        (minimumValue + percentage * (maximumValue - minimumValue)) / step
      ) * step;
      onValueChange(newValue);
    },
  });

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View className="w-full py-2">
      <View
        className={`h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      >
        {/* Progreso */}
        <View
          className="h-1 rounded-full bg-blue-500"
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb */}
        <View
          {...panResponder.panHandlers}
          className="absolute h-6 w-6 rounded-full bg-blue-500 shadow-lg"
          style={{
            left: `${percentage}%`,
            marginLeft: -12,
            top: -10,
          }}
        />
      </View>
    </View>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const { currentTheme } = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleNearbyToggle = async (value: boolean) => {
    if (value) {
      setLocationLoading(true);
      const coords = await getUserLocation();
      setLocationLoading(false);
      
      if (coords) {
        setFilters(prev => ({
          ...prev,
          nearbyEnabled: true,
          latitude: coords.latitude,
          longitude: coords.longitude,
          sortBy: 'distance',
        }));
      } else {
        // Si falla, revertir el toggle
        setFilters(prev => ({
          ...prev,
          nearbyEnabled: false,
        }));
      }
    } else {
      setFilters(prev => ({
        ...prev,
        nearbyEnabled: false,
        latitude: undefined,
        longitude: undefined,
        sortBy: undefined,
      }));
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      searchText: '',
      nearbyEnabled: false,
      maxDistance: 10000,
      category: undefined,
      sortBy: undefined,
      latitude: undefined,
      longitude: undefined,
    };
    setFilters(clearedFilters);
    onApply(clearedFilters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.nearbyEnabled) count++;
    if (filters.category) count++;
    if (filters.searchText) count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View
          className={`rounded-t-3xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}
          style={{ maxHeight: '85%' }}
        >
          <ScrollView 
            className="px-6 pt-6"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className={`text-2xl font-bold ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                Filtros
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? '#E5E7EB' : '#374151'}
                />
              </TouchableOpacity>
            </View>

            {/* Servicios Cercanos Toggle */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={24}
                    color={isDark ? '#E5E7EB' : '#374151'}
                  />
                  <Text
                    className={`ml-3 text-lg font-semibold ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    Servicios cercanos
                  </Text>
                </View>
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Switch
                    value={filters.nearbyEnabled}
                    onValueChange={handleNearbyToggle}
                    trackColor={{ false: '#767577', true: '#3B82F6' }}
                    thumbColor={filters.nearbyEnabled ? '#60A5FA' : '#f4f3f4'}
                  />
                )}
              </View>

              {/* Slider de Distancia */}
              {filters.nearbyEnabled && (
                <View className="mt-4">
                  <Text
                    className={`text-sm mb-3 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Radio de búsqueda: {(filters.maxDistance / 1000).toFixed(0)} km
                  </Text>
                  <SimpleSlider
                    value={filters.maxDistance}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, maxDistance: value }))
                    }
                    minimumValue={1000}
                    maximumValue={50000}
                    step={1000}
                    isDark={isDark}
                  />
                  <View className="flex-row justify-between mt-2">
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      1 km
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      50 km
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Categoría */}
            <View className="mb-6">
              <Text
                className={`text-lg font-semibold mb-3 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                Categoría
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, category: undefined }))}
                  className={`px-4 py-2 rounded-full ${
                    !filters.category ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={
                      !filters.category
                        ? 'text-white font-semibold'
                        : isDark ? 'text-gray-300' : 'text-gray-700'
                    }
                  >
                    Todas
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFilters(prev => ({ ...prev, category: cat }))}
                    className={`px-4 py-2 rounded-full ${
                      filters.category === cat ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={
                        filters.category === cat
                          ? 'text-white font-semibold'
                          : isDark ? 'text-gray-300' : 'text-gray-700'
                      }
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ordenar por */}
            <View className="mb-6">
              <Text
                className={`text-lg font-semibold mb-3 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                Ordenar por
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {['distance', 'createdAt', 'favorites'].map((sort) => {
                  const labels = {
                    distance: 'Distancia',
                    createdAt: 'Más recientes',
                    favorites: 'Más populares',
                  };
                  const isDisabled = sort === 'distance' && !filters.nearbyEnabled;
                  
                  return (
                    <TouchableOpacity
                      key={sort}
                      disabled={isDisabled}
                      onPress={() =>
                        setFilters(prev => ({
                          ...prev,
                          sortBy: sort as FilterState['sortBy'],
                        }))
                      }
                      className={`px-4 py-2 rounded-full ${
                        isDisabled
                          ? 'bg-gray-400 opacity-50'
                          : filters.sortBy === sort
                          ? 'bg-blue-500'
                          : isDark ? 'bg-gray-800' : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={
                          filters.sortBy === sort
                            ? 'text-white font-semibold'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }
                      >
                        {labels[sort as keyof typeof labels]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Botones fijos al fondo */}
          <View className="px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClear}
                className={`flex-1 py-3 rounded-xl border-2 ${
                  isDark ? 'border-gray-700' : 'border-gray-300'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Limpiar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                className="flex-1 py-3 rounded-xl bg-blue-500"
              >
                <Text className="text-center font-semibold text-white">
                  Aplicar {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};