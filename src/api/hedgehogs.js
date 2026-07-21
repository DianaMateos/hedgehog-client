import api from './axios';

export const getHedgehogs = async () => {
  const response = await api.get('/hedgehogs');
  return response.data;
};

export const createHedgehog = async (data) => {
  const response = await api.post('/hedgehogs', data);
  return response.data;
};


export const deleteHedgehog = async (id) => {
  const response = await api.delete(`/hedgehogs/${id}`);
  return response.data;
};