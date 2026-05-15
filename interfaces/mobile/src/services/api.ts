import axios from 'axios';

// Adresse IP de la machine hôte pour le développement mobile
const API_URL = 'http://192.168.88.250:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  signIn: async (credentials: any) => {
    const response = await api.post('/api/auth/signin', credentials);
    return response.data;
  },
  signUp: async (userData: any) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/api/auth/users');
    return response.data;
  },
};

export const blockchainService = {
  getStatus: async () => {
    const response = await api.get('/api/blockchain/');
    return response.data;
  },
  getBlocks: async () => {
    const response = await api.get('/api/blockchain/blocks');
    return response.data;
  },
  mine: async () => {
    const response = await api.post('/api/blockchain/mine');
    return response.data;
  },
};

export const landService = {
  getParcelsByOwner: async (publicKey: string) => {
    const response = await api.get(`/api/land/owner/${publicKey}`);
    return response.data;
  },
};

export const algoService = {
  getDistricts: async () => {
    const response = await api.get('/api/algo/districts');
    return response.data;
  },
};

export const educationService = {
  certifyDiploma: async (diplomaData: { student_id: string; degree_title: string; university: string; year: number }) => {
    const response = await api.post('/api/education/certify', diplomaData);
    return response.data;
  },
  getDiplomaProof: async (diplomaId: string) => {
    const response = await api.get(`/api/education/proof/${diplomaId}`);
    return response.data;
  },
  getDiploma: async (diplomaId: string) => {
    const response = await api.get(`/api/education/diploma/${diplomaId}`);
    return response.data;
  },
};

export const agriService = {
  recordHarvest: async (harvestData: any) => {
    const response = await api.post('/api/agriculture/harvest', harvestData);
    return response.data;
  },
  optimizeTransport: async (transportData: { lot_id: string; destination: string }) => {
    const response = await api.post('/api/agriculture/transport', transportData);
    return response.data;
  },
  getLot: async (lotId: string) => {
    const response = await api.get(`/api/agriculture/lot/${lotId}`);
    return response.data;
  },
  getAllLots: async () => {
    const response = await api.get('/api/agriculture/all');
    return response.data;
  },
};


export default api;
