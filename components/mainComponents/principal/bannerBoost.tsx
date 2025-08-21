import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const BannerBoost = () => {
  return (
    <>
      {/* Boost Banner */}
      <View className="px-4 mt-2 mb-4">
        <View
          className="flex-row items-center bg-blue-100 border border-blue-300 rounded-xl p-4"
          style={{ elevation: 2 }}
        >
          <Ionicons
            name="rocket-outline"
            size={28}
            color="#2563eb"
            style={{ marginRight: 12 }}
          />
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-base text-blue-800 mr-2">
                ¡Impulsa tu servicio!
              </Text>
              <Ionicons name="flash-outline" size={18} color="#fbbf24" />
            </View>
            <Text className="text-xs text-blue-900 mb-1">
              Destaca tu publicación y consigue más clientes. Planes desde{" "}
              <Text className="font-bold">$30</Text> por 24h.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/boost/boostHome")}
            className="ml-2 bg-blue-600 rounded-full px-3 py-2"
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold text-xs">Ver más</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};
