import { User, Transaction, ServiceRequest } from '../types';

// Configuration for Backend Integration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !BASE_URL;

const STORAGE_KEY = 'buydigital_data';
const TOKEN_KEY = 'buydigital_token';

interface AppState {
  user: User | null;
  transactions: Transaction[];
  requests: ServiceRequest[];
}

// --- MOCK LOGIC (For development without backend) ---

const initialState: AppState = {
  user: {
    id: '1',
    firstName: 'Mubarak',
    lastName: 'Kasim',
    email: 'mubarak@buydigital.ng',
    phone: '08123456789',
    balance: 12500,
    referralCode: 'BUYDIGI99',
    isReseller: false,
    commissionBalance: 0,
    totalEarnings: 0,
    totalReferrals: 0
  },
  transactions: [
    { id: '1', type: 'Data', amount: 2500, status: 'Success', date: '2024-02-22 09:12 AM', details: 'MTN 10GB SME Data', recipient: '08031234567' },
    { id: '2', type: 'Airtime', amount: 500, status: 'Success', date: '2024-02-21 04:45 PM', details: 'Airtel Airtime VTU', recipient: '09012345678' },
    { id: '3', type: 'Transfer', amount: 5000, status: 'Success', date: '2024-02-20 11:20 AM', details: 'Wallet Transfer to Aisha', recipient: '08123456789' },
    { id: '4', type: 'Electricity', amount: 10000, status: 'Success', date: '2024-02-18 02:15 PM', details: 'IKEDC Prepaid Token', recipient: '0101234567890' },
  ],
  requests: [
    { id: 'REQ-98231', service: 'JAMB UTME Without Mock', date: '2024-02-22 10:15 AM', status: 'Pending', price: 7100, details: 'Profile Code: 1234567890' },
    { id: 'REQ-98230', service: "JAMB O'Level Result Upload", date: '2024-02-21 02:30 PM', status: 'Processing', price: 1500, details: 'Reg No: 202412345678AB' },
  ]
};

const getState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialState;
};

const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// --- REAL BACKEND LOGIC (Fetch Wrapper) ---

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data as T;
}

// --- API EXPORTS (Unified Interface) ---

export const api = {
  // Auth
  login: async (email: string, pass: string): Promise<User> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      const state = getState();
      if (!state.user) throw new Error('User not found');
      return state.user;
    }

    const response = await request<{ user: User, token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    localStorage.setItem(TOKEN_KEY, response.token);
    return response.user;
  },

  signup: async (userData: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1500));
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        balance: 0,
        referralCode: 'NEWUSER' + Math.floor(Math.random() * 1000),
        isReseller: false,
        ...userData
      };
      const state = getState();
      state.user = newUser;
      saveState(state);
      return newUser;
    }

    const response = await request<{ user: User, token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    localStorage.setItem(TOKEN_KEY, response.token);
    return response.user;
  },

  // User
  getUser: async (): Promise<User | null> => {
    if (USE_MOCK) {
      return getState().user;
    }
    return request<User>('/auth/me');
  },

  updateUser: async (userData: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      const state = getState();
      if (!state.user) throw new Error('User not found');
      state.user = { ...state.user, ...userData };
      saveState(state);
      return state.user;
    }
    return request<User>('/auth/update', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  updateBalance: async (amount: number): Promise<number> => {
    if (USE_MOCK) {
      const state = getState();
      if (state.user) {
        state.user.balance += amount;
        saveState(state);
        return state.user.balance;
      }
      return 0;
    }

    const res = await request<{ balance: number }>('/user/balance', {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
    return res.balance;
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    if (USE_MOCK) return getState().transactions;
    return request<Transaction[]>('/transactions');
  },

  addTransaction: async (tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      const state = getState();
      const newTx: Transaction = {
        ...tx,
        id: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleString(),
      };
      state.transactions = [newTx, ...state.transactions];

      if (state.user && tx.type !== 'Funding') {
        state.user.balance -= tx.amount;
      } else if (state.user && tx.type === 'Funding') {
        state.user.balance += tx.amount;
      }

      saveState(state);
      return newTx;
    }

    return request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  // Requests (JAMB, NIN, etc.)
  getRequests: async (): Promise<ServiceRequest[]> => {
    if (USE_MOCK) return getState().requests;
    return request<ServiceRequest[]>('/requests');
  },

  addRequest: async (req: Omit<ServiceRequest, 'id' | 'date' | 'status'>): Promise<ServiceRequest> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      const state = getState();
      const newReq: ServiceRequest = {
        ...req,
        id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        status: 'Pending'
      };
      state.requests = [newReq, ...state.requests];

      if (state.user) {
        state.user.balance -= req.price;
      }

      saveState(state);
      return newReq;
    }

    return request<ServiceRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  // Upgrade to Reseller
  upgradeToReseller: async (): Promise<User> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1500));
      const state = getState();
      if (!state.user) throw new Error('User not found');
      if (state.user.isReseller) throw new Error('Already a reseller');
      if (state.user.balance < 2000) throw new Error('Insufficient balance. You need at least ₦2,000.');

      // Deduct upgrade fee
      state.user.balance -= 2000;
      state.user.isReseller = true;
      state.user.commissionBalance = 0;
      state.user.totalEarnings = 0;
      state.user.totalReferrals = 0;
      state.user.upgradeDate = new Date().toISOString();

      // Add upgrade transaction
      const upgradeTx: Transaction = {
        id: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        type: 'Funding',
        amount: -2000,
        status: 'Success',
        date: new Date().toLocaleString(),
        details: 'Reseller Pro Upgrade — Lifetime Access'
      };
      state.transactions = [upgradeTx, ...state.transactions];

      saveState(state);
      return state.user;
    }

    return request<User>('/user/upgrade', {
      method: 'POST',
    });
  }
};

