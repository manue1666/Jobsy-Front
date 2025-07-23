import api from '@/request';
import AsyncStorage from '@react-native-async-storage/async-storage';

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: any }> {
  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios'); 
  }

  if (!validateEmail(email)) {
    throw new Error('Email inválido');
  }

  // 2) Llamada al back
  const response = await api.post('/user/login', { email, password }, {
    headers: { 'Content-Type': 'application/json' }
  });

  const { token, user } = response.data;
  
  // 3) Persistir en AsyncStorage
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));

  return { token, user };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<void> {
  // Validación de campos
  if (!name || !email || !password) {
	  throw new Error('Todos los campos son obligatorios');
  }

  if (!validateEmail(email)) {
    throw new Error('Email inválido');
  }

  // Llamada al back
  const response = await api.post('/user/regist', { name, email, password }, {
    headers: { 'Content-Type': 'application/json', "Accept": "application/json" }
  });

  if (!response.data.success) {
	  throw new Error(response.data.message || 'Error en el registro');
  }
}
