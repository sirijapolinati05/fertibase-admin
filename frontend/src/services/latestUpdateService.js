import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const fetchUpdates = async () => {
  const { data } = await axios.get(`${API_BASE}/latest-updates/`);
  return { data, error: null };
};

export const createUpdate = async (payload) => {
  const { data } = await axios.post(`${API_BASE}/latest-updates/`, payload);
  return { data, error: null };
};

export const toggleUpdateStatus = async (id, is_active) => {
  const { data } = await axios.put(`${API_BASE}/latest-updates/${id}`, { is_active: !is_active });
  return { data, error: null };
};

export const deleteUpdate = async (id) => {
  await axios.delete(`${API_BASE}/latest-updates/${id}`);
  return { error: null };
};

export const updateUpdate = async (id, payload) => {
  const { data } = await axios.put(`${API_BASE}/latest-updates/${id}`, payload);
  return { data, error: null };
};
