import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type AlertType = 'success' | 'error';

type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
};

type AlertContextType = {
  okAlert: (title: string, message: string) => void;
  errAlert: (title: string, message: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AlertState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showAlert = (type: AlertType, title: string, message: string) => {
    setState({ visible: true, type, title, message });
  };

  const okAlert = (title: string, message: string) => showAlert('success', title, message);
  const errAlert = (title: string, message: string) => showAlert('error', title, message);

  const handleClose = () => setState(s => ({ ...s, visible: false }));

  return (
    <AlertContext.Provider value={{ okAlert, errAlert }}>
      {children}
      <Modal
        transparent
        visible={state.visible}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className={`w-80 p-7 rounded-2xl items-center border ${state.type === 'success' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} shadow-lg`} style={{ elevation: 8 }}>
            <MaterialIcons
              name={state.type === 'success' ? 'check-circle' : 'error-outline'}
              size={56}
              color={state.type === 'success' ? '#22c55e' : '#ef4444'}
              style={{ marginBottom: 10 }}
            />
            <Text className={`text-2xl font-bold mb-2 ${state.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{state.title}</Text>
            <Text className={`text-base mb-6 text-center ${state.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>{state.message}</Text>
            <TouchableOpacity
              className={`${state.type === 'success' ? 'bg-green-600' : 'bg-red-600'} px-8 py-3 rounded-full shadow`}
              onPress={handleClose}
            >
              <Text className="text-white font-bold text-lg tracking-wide">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};
