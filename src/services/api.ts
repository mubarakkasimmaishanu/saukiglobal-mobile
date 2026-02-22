import { User, Transaction, ServiceRequest } from '../types';

// This service is designed to be easily replaced with real API calls (fetch/axios)
// For now, it uses localStorage to persist state for a "100% ready" frontend experience.

const STORAGE_KEY = 'buydigital_data';

interface AppState {
  user: User | null;
  transactions: Transaction[];
  requests: ServiceRequest[];
}

const initialState: AppState = {
  user: {
    id: '1',
    firstName: 'Mubarak',
    lastName: 'Olawale',
    email: 'mubarak@buydigital.ng',
    phone: '08123456789',
    balance: 12500,
    referralCode: 'BUYDIGI99',
    isReseller: true
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

export const api = {
  // Auth
  login: async (email: string, pass: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 1000));
    const state = getState();
    if (!state.user) throw new Error('User not found');
    return state.user;
  },

  signup: async (userData: Partial<User>): Promise<User> => {
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
  },

  // User
  getUser: async (): Promise<User | null> => {
    return getState().user;
  },

  updateBalance: async (amount: number): Promise<number> => {
    const state = getState();
    if (state.user) {
      state.user.balance += amount;
      saveState(state);
      return state.user.balance;
    }
    return 0;
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    return getState().transactions;
  },

  addTransaction: async (tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    await new Promise(r => setTimeout(r, 1000));
    const state = getState();
    const newTx: Transaction = {
      ...tx,
      id: 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleString(),
    };
    state.transactions = [newTx, ...state.transactions];
    
    // Deduct from balance if it's a payment
    if (state.user && tx.type !== 'Funding') {
      state.user.balance -= tx.amount;
    } else if (state.user && tx.type === 'Funding') {
      state.user.balance += tx.amount;
    }
    
    saveState(state);
    return newTx;
  },

  // Requests
  getRequests: async (): Promise<ServiceRequest[]> => {
    return getState().requests;
  },

  addRequest: async (req: Omit<ServiceRequest, 'id' | 'date' | 'status'>): Promise<ServiceRequest> => {
    await new Promise(r => setTimeout(r, 1000));
    const state = getState();
    const newReq: ServiceRequest = {
      ...req,
      id: 'REQ-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleString(),
      status: 'Pending'
    };
    state.requests = [newReq, ...state.requests];
    
    // Deduct from balance
    if (state.user) {
      state.user.balance -= req.price;
    }
    
    saveState(state);
    return newReq;
  }
};
