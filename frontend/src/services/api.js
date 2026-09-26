import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data;
  } catch (err) {
    return {
      status: 'demo-local',
      aiEngine: 'DEMO MODE (Client Fallback)',
      demoMode: true
    };
  }
};

export const getDashboardData = async () => {
  try {
    const res = await api.get('/dashboard');
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, returning fallback dashboard data');
    return null;
  }
};

export const getCitizenRequests = async (params = {}) => {
  try {
    const res = await api.get('/requests', { params });
    return res.data;
  } catch (err) {
    return { total: 0, requests: [] };
  }
};

export const analyzeRequest = async (payload) => {
  try {
    const res = await api.post('/analyze', payload);
    return res.data;
  } catch (err) {
    // Client-side fallback if backend not running
    return {
      language: payload.language || 'Telugu',
      translation: "Our village has had a drinking water problem for the past two years. The situation becomes even more severe in summer.",
      category: 'Water & Sanitation',
      subcategory: 'Drinking Water Grid',
      location: 'Telangana',
      country: 'India',
      urgency: 'High',
      affectedPopulation: 8400,
      confidence: 0.94,
      infrastructureNeed: 'Piped Water Grid & Micro-Filtration Units',
      sentiment: 0.85,
      priorityScore: 91,
      isDemoMode: true
    };
  }
};

export const getHotspots = async () => {
  try {
    const res = await api.get('/hotspots');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const getInfrastructureData = async () => {
  try {
    const res = await api.get('/infrastructure');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const getRecommendations = async () => {
  try {
    const res = await api.get('/recommendations');
    return res.data;
  } catch (err) {
    return [];
  }
};

export const generatePolicyBriefApi = async (payload) => {
  try {
    const res = await api.post('/policy-brief', payload);
    return res.data;
  } catch (err) {
    return null;
  }
};

export const simulateImpactApi = async (payload) => {
  try {
    const res = await api.post('/impact', payload);
    return res.data;
  } catch (err) {
    return null;
  }
};

export default api;
