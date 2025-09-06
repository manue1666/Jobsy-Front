import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

type AlertProps = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export const SuccessAlert: React.FC<AlertProps> = ({ visible, title = 'Éxito', message, onClose }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/30 justify-center items-center">
      <View className="w-72 p-6 rounded-xl items-center bg-green-50 border-2 border-green-500">
        <Text className="text-xl font-bold mb-3 text-green-700">{title}</Text>
        <Text className="text-base mb-5 text-center text-green-900">{message}</Text>
        <TouchableOpacity className="bg-green-600 px-6 py-2 rounded-lg" onPress={onClose}>
          <Text className="text-white font-bold text-base">OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const ErrorAlert: React.FC<AlertProps> = ({ visible, title = 'Error', message, onClose }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/30 justify-center items-center">
      <View className="w-72 p-6 rounded-xl items-center bg-red-50 border-2 border-red-500">
        <Text className="text-xl font-bold mb-3 text-red-700">{title}</Text>
        <Text className="text-base mb-5 text-center text-red-900">{message}</Text>
        <TouchableOpacity className="bg-red-600 px-6 py-2 rounded-lg" onPress={onClose}>
          <Text className="text-white font-bold text-base">OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
