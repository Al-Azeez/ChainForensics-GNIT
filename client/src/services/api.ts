import axios from 'axios';
import { Investigation, SystemHealth, User, DemoScenario } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for attaching auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('chainforensics_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // System Health
  getHealth: async (): Promise<SystemHealth> => {
    const res = await apiClient.get<SystemHealth>('/health');
    return res.data;
  },

  // Auth
  register: async (payload: { email: string; password: string; name: string }) => {
    const res = await apiClient.post<{ message: string; token: string; user: User }>('/auth/register', payload);
    return res.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post<{ token: string; user: User }>('/auth/login', payload);
    return res.data;
  },
  demoLogin: async () => {
    const res = await apiClient.post<{ token: string; user: User }>('/auth/demo-login');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data;
  },

  // Investigations
  analyze: async (payload: {
    identifier: string;
    title?: string;
    network?: string;
    analysisScope?: string;
    demoMode?: boolean;
    demoScenarioId?: string;
  }): Promise<{ investigationId: string; investigation: Investigation }> => {
    const res = await apiClient.post<{ investigationId: string; investigation: Investigation }>('/investigations/analyze', payload);
    return res.data;
  },

  getDemoScenarios: async (): Promise<DemoScenario[]> => {
    const res = await apiClient.get<{ scenarios: DemoScenario[] }>('/investigations/demo-scenarios');
    return res.data.scenarios;
  },

  getInvestigations: async (params?: { search?: string; classification?: string; limit?: number }) => {
    const res = await apiClient.get<{ investigations: Investigation[]; count: number }>('/investigations', { params });
    return res.data;
  },

  getInvestigationById: async (id: string): Promise<Investigation> => {
    const res = await apiClient.get<{ investigation: Investigation }>(`/investigations/${id}`);
    return res.data.investigation;
  },

  updateInvestigation: async (id: string, payload: { title?: string; notes?: string; tags?: string[] }): Promise<Investigation> => {
    const res = await apiClient.patch<{ investigation: Investigation }>(`/investigations/${id}`, payload);
    return res.data.investigation;
  },

  deleteInvestigation: async (id: string): Promise<void> => {
    await apiClient.delete(`/investigations/${id}`);
  }
};
