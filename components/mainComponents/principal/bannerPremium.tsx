import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const BannerPremium = () => {
  return (
    <View className="px-4 mt-2 mb-4">
      <View
        className="flex-row items-center bg-yellow-50 border border-yellow-300 rounded-xl p-4"
        style={{ elevation: 2 }}
      >
        <Ionicons
          name="star"
          size={28}
          color="#FFD700"
          style={{ marginRight: 12 }}
        />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-bold text-base text-yellow-800 mr-2">
              ¡Hazte usuario Premium!
            </Text>
            <Ionicons name="star-outline" size={18} color="#FFD700" />
          </View>
          <Text className="text-xs text-yellow-900 mb-1">
            Disfruta de beneficios exclusivos y destaca entre los demás. Solo{" "}
            <Text className="font-bold">$99</Text> MXN al mes.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/premium/premiumHome")}
          className="ml-2 bg-yellow-400 rounded-full px-3 py-2"
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold text-xs">Ver más</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
