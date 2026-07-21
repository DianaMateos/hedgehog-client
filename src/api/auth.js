import api from './axios';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  console.log('Respuesta del backend:', response.data); // <--- Chequemos esto en la consola F12

  // Intenta guardar token según las estructuras más comunes
  const token = response.data.token || response.data.access_token;
  
  if (token) {
    localStorage.setItem('token', token);
  } else {
    console.error('El backend respondió bien pero no envió la clave "token":', response.data);
  }
  
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/logout');
  } finally {
    localStorage.removeItem('token');
  }
};