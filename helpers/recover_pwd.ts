import api from '@/request';

export async function recoverPassword(email: string): Promise<string> {
  if (!email) {
    throw new Error('El email es obligatorio');
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }

  const response = await api.post('/email/recover', { email }, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.data.ok) {
    throw new Error(response.data.msg || 'No se pudo enviar el correo de recuperación');
  }

  return response.data.msg;
}
