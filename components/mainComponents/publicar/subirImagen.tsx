import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '@/context/themeContext';

interface ImageUploadProps {
  maxImages?: number;
  onImagesChange?: (images: string[]) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  maxImages = 5, 
  onImagesChange 
}) => {
  const [images, setImages] = useState<string[]>([]);
  const {currentTheme} = useContext(ThemeContext);
  const isDark = currentTheme === 'dark';

  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Límite alcanzado', `Solo puedes subir ${maxImages} imágenes`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0]) {
      const newImages = [...images, result.assets[0].uri];
      setImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const renderUploadSlot = (index: number) => {
    const hasImage = images[index];

    return (
      <TouchableOpacity
        key={index}
        onPress={hasImage ? () => removeImage(index) : pickImage}
        className={`w-24 h-24 rounded-xl items-center justify-center mr-3 ${
          isDark ? 'bg-gray-700' : 'bg-gray-200'
        }`}
      >
        {hasImage ? (
          <>
            <Image 
              source={{ uri: hasImage }} 
              className="w-full h-full rounded-xl" 
              resizeMode="cover"
            />
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
              <Ionicons name="close" size={16} color="white" />
            </View>
          </>
        ) : (
          <Ionicons 
            name="cloud-upload-outline" 
            size={28} 
            color={isDark ? '#9CA3AF' : '#6B7280'} 
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-6">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      >
        {Array.from({ length: maxImages }).map((_, index) => renderUploadSlot(index))}
      </ScrollView>
    </View>
  );
};