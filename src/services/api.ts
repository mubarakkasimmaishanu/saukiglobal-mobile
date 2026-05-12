import { User, Transaction, ServiceRequest } from '../types';

// SaukiGlobal Unified API Configuration
const BASE_URL = 'https://saukiglobal.com/api/v1/';
const STORAGE_KEY = 'saukiglobal_data';
const API_KEY_KEY = 'saukiglobal_api_key';

// Helper to get API Key
const getApiKey = () => localStorage.getItem(API_KEY_KEY) || '';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status: 'success' | 'failed' | 'processing';
}

/**
 * Core Request Wrapper for SaukiGlobal API
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const apiKey = getApiKey();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'sApiKey': apiKey,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Handle global auth failure (if applicable)
  if (response.status === 401) {
    // Potential logout logic
  }

  return data as ApiResponse<T>;
}

/**
 * Atomic Polling for "processing" transactions
 */
async function pollTransaction(ref: string, maxAttempts = 10): Promise<ApiResponse> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const res = await request(`verify.php?ref=${ref}`);
    if (res.status !== 'processing') {
      return res;
    }
    attempts++;
    await new Promise(r => setTimeout(r, 3000)); // Poll every 3 seconds
  }
  return { success: false, message: 'Transaction timeout', data: {}, status: 'failed' };
}

export const api = {
  // Auth
  login: async (apiKey: string): Promise<User> => {
    // For SaukiGlobal, login is essentially providing the API Key
    localStorage.setItem(API_KEY_KEY, apiKey);
    
    const res = await request<User>('services.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getUser' })
    });

    if (!res.success) {
      localStorage.removeItem(API_KEY_KEY);
      throw new Error(res.message);
    }
    return res.data;
  },

  // Services Integration (Unified Endpoint)
  performService: async (serviceData: any): Promise<ApiResponse> => {
    const res = await request('services.php', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });

    if (res.status === 'processing' && res.data?.reference) {
      return await pollTransaction(res.data.reference);
    }

    return res;
  },

  // Airtime
  buyAirtime: async (network: string, amount: number, phone: string) => {
    return api.performService({
      action: 'airtime',
      network,
      amount,
      phone
    });
  },

  // Data
  buyData: async (network: string, plan: string, phone: string) => {
    return api.performService({
      action: 'data',
      network,
      plan,
      phone
    });
  },

  // Cable
  payCable: async (provider: string, iuc: string, plan: string) => {
    return api.performService({
      action: 'cable',
      provider,
      iuc,
      plan
    });
  },

  // Electricity
  payElectricity: async (disco: string, meter: string, amount: number, type: 'prepaid' | 'postpaid') => {
    return api.performService({
      action: 'electricity',
      disco,
      meter,
      amount,
      type
    });
  },

  // Transaction History
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await request<Transaction[]>('services.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getTransactions' })
    });
    return res.data || [];
  },

  // User Profile
  getUser: async (): Promise<User | null> => {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    
    const res = await request<User>('services.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'getUser' })
    });
    return res.success ? res.data : null;
  }
};


