import { View } from '@/components/Themed';
import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function Layout() {
  const colorScheme = useColorScheme();
  
  return (
    <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <Slot />
    </View>
  );
}