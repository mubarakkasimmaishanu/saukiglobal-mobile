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
    localStorage.removeItem(API_KEY_KEY);
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
  login: async (email: string, password: string): Promise<User> => {
    const res = await request<{ token: string, user: User }>('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!res.success) {
      throw new Error(res.message);
    }
    
    // Store API Key for future authenticated requests
    localStorage.setItem(API_KEY_KEY, res.data.token);
    return res.data.user;
  },

  register: async (name: string, email: string, phone: string, password: string): Promise<User> => {
    const res = await request<{ token: string, user: User }>('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password })
    });

    if (!res.success) {
      throw new Error(res.message);
    }

    localStorage.setItem(API_KEY_KEY, res.data.token);
    return res.data.user;
  },
  
  logout: () => {
    localStorage.removeItem(API_KEY_KEY);
  },

  // Services Integration (Unified Endpoint)
  performService: async (serviceData: any): Promise<ApiResponse> => {
    const res = await request('services.php', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
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

  // Exam PINs
  buyExamPin: async (exam: string, quantity: number) => {
    return api.performService({
      action: 'exams',
      exam,
      quantity
    });
  },

  // Alpha Topup
  buyAlpha: async (phone: string, amount: number) => {
    return api.performService({
      action: 'alpha',
      phone,
      amount
    });
  },

  // Kirani Service
  buyKirani: async (kiraniId: string, amount: number) => {
    return api.performService({
      action: 'kirani',
      kiraniId,
      amount
    });
  },

  // Smile Services
  buySmile: async (smileId: string, plan: string, type: string) => {
    return api.performService({
      action: 'smile',
      smileId,
      plan,
      type
    });
  },

  // Airtime to Cash
  submitA2C: async (network: string, phone: string, amount: number) => {
    return api.performService({
      action: 'a2c',
      network,
      phone,
      amount
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
  },

  // Upgrade to Reseller
  upgradeToReseller: async () => {
    return api.performService({
      action: 'upgrade_tier'
    });
  },

  // Add mock transaction (for UI updates, though ideally the backend returns them)
  addTransaction: async (tx: any) => {
    // In a real app this might be hitting an endpoint to log transfer
    return api.performService({
      action: 'transfer',
      ...tx
    });
  },

  addRequest: async (req: any) => {
    return api.performService({
      action: 'add_request',
      ...req
    });
  },

  getRequests: async (): Promise<any[]> => {
    const res = await request<any[]>('services.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'get_requests' })
    });
    return res.data || [];
  },

  updateUser: async (data: any) => {
    return api.performService({
      action: 'update_profile',
      ...data
    });
  }
};


