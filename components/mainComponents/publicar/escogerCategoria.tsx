import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import { ThemeContext } from '@/context/themeContext';

export const CATEGORIES = [
  "tecnologia",
  "electronica",
  "electricidad",
  "plomeria",
  "construccion",
  "remodelacion",
  "limpieza",
  "reparaciones",
  "hogar",
  "belleza",
  "mascotas",
  "educacion",
  "tutorias",
  "eventos",
  "entretenimiento",
  "transporte",
  "fletes",
  "ventas",
  "cocina",
  "salud",
  "administrativo",
  "otros",
];

interface CategorySelectorProps {
  label: string;
  error?: string;
  isRequired?: boolean;
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

export function CategorySelector({
  label,
  error,
  isRequired = false,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
    const {currentTheme} = useContext(ThemeContext);
    const isDark = currentTheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        isDark ? styles.darkCategoryItem : styles.lightCategoryItem,
        selectedCategory === item && styles.selectedItem,
      ]}
      onPress={() => {
        onCategoryChange(item);
        setModalVisible(false);
      }}
    >
      <Text
        style={[
          isDark ? styles.darkText : styles.lightText,
          selectedCategory === item && styles.selectedText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-4">
      <Text
        className={`${isDark ? "text-gray-400" : "text-gray-700"} text-sm mb-2`}
      >
        {label}
        {isRequired && <Text className="text-red-500"> *</Text>}
      </Text>

      <TouchableOpacity
        className={`${isDark ? "bg-gray-700" : "bg-gray-100"} rounded-xl px-4 py-4 text-base ${isDark ? "text-white" : "text-black"} ${error ? "border-2 border-red-500" : ""}`}
        onPress={() => setModalVisible(true)}
      >
        <Text style={isDark ? styles.darkText : styles.lightText}>
          {selectedCategory || "Selecciona una categoría"}
        </Text>
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              isDark ? styles.darkModalContent : styles.lightModalContent,
            ]}
          >
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContainer}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: 10,
    padding: 20,
  },
  darkModalContent: {
    backgroundColor: "#374151", // gray-700
  },
  lightModalContent: {
    backgroundColor: "#F3F4F6", // gray-100
  },
  listContainer: {
    paddingBottom: 20,
  },
  categoryItem: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  darkCategoryItem: {
    backgroundColor: "#4B5563", // gray-600
  },
  lightCategoryItem: {
    backgroundColor: "#E5E7EB", // gray-200
  },
  selectedItem: {
    backgroundColor: "#3B82F6", // blue-500
  },
  darkText: {
    color: "white",
  },
  lightText: {
    color: "black",
  },
  selectedText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#3B82F6", // blue-500
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
