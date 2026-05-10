import axios from 'axios';

// On utilise une adresse par défaut pour le développement local
// '10.0.2.2' est l'adresse pour accéder au localhost de la machine hôte depuis un émulateur Android
// Pour un appareil physique sur le même réseau Wifi, utilisez l'IP de votre machine.
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
  verifyTransaction: async (txHash: string) => {
    const response = await api.get(`/api/blockchain/verify/${txHash}`);
    return response.data;
  },
  createTransaction: async (txData: any) => {
    const response = await api.post('/api/blockchain/transactions', txData);
    return response.data;
  },
};

export const landService = {
  getParcel: async (parcelId: string) => {
    const response = await api.get(`/api/land/${parcelId}`);
    return response.data;
  },
  getHistory: async (parcelId: string) => {
    const response = await api.get(`/api/land/history/${parcelId}`);
    return response.data;
  },
  getParcelsByOwner: async (publicKey: string) => {
    const response = await api.get(`/api/land/owner/${publicKey}`);
    return response.data;
  },
  submitRequest: async (requestData: any) => {
    const response = await api.post('/api/land/request', requestData);
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/api/land/pending');
    return response.data;
  },
  approveRequest: async (requestId: number) => {
    const response = await api.post(`/api/land/approve/${requestId}`);
    return response.data;
  },
  registerParcel: async (registrationData: any) => {
    const response = await api.post('/api/land/register', registrationData);
    return response.data;
  },
  transferParcel: async (transferData: any) => {
    const response = await api.post('/api/land/transfer', transferData);
    return response.data;
  },
};

export const algoService = {
  getDistricts: async () => {
    const response = await api.get('/api/algo/districts');
    return response.data;
  },
  findPath: async (startId: number, endId: number) => {
    const response = await api.post('/api/algo/path', { start_id: startId, end_id: endId });
    return response.data;
  },
  selectValidator: async (currentDistrictId: number) => {
    const response = await api.post('/api/algo/select-validator', { current_district_id: currentDistrictId });
    return response.data;
  },
};

export default api;
