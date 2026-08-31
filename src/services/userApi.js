import api from './api';

export const getUsersApi = async () => {
  const response = await api.get('/users/user');
  return response.data;
};

export const getUserByIdApi = async (id) => {
  const response = await api.get(`/users/user/${id}`);
  return response.data;
};

export const createUserApi = async (payload) => {
  const response = await api.post('/users/user', payload);
  return response.data;
};

export const updateUserApi = async (id, payload) => {
  const response = await api.put(`/users/user/${id}`, payload);
  return response.data;
};

export const deleteUserApi = async (id) => {
  const response = await api.delete(`/users/user/${id}`);
  return response.data;
};

export const getTeamUsersApi = async (teamLeadId) => {
  const response = await api.get(`/users/teamUsers/${teamLeadId}`);
  return response.data;
};

export default {
  getUsersApi,
  getUserByIdApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  getTeamUsersApi,
};