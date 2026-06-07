import { User, Transaction } from '../types';

// SaukiGlobal Unified API Configuration
const envBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://saukiglobal.com/api/v1/';
const BASE_URL = envBaseUrl.replace(/\/+$/, '') + '/';
const API_KEY_KEY = 'saukiglobal_api_key';

// Helper to get API Key
const getApiKey = () => localStorage.getItem(API_KEY_KEY) || '';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status: 'success' | 'failed' | 'processing' | boolean;
}

/**
 * Core Request Wrapper for SaukiGlobal API
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const apiKey = getApiKey();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': apiKey ? `Bearer ${apiKey}` : '',
    'sApiKey': apiKey,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle global auth failure
  if (response.status === 401) {
    localStorage.removeItem(API_KEY_KEY);
  }

  const data = await response.json();

  // Normalize backend 'status' boolean/string to 'success' boolean
  if (typeof data.status === 'boolean') {
    data.success = data.status;
  } else if (data.status === 'success') {
    data.success = true;
  } else if (data.status === 'failed') {
    data.success = false;
  } else if (data.status === 'processing') {
    data.success = true;
  } else {
    data.success = !!data.status;
  }

  return data as ApiResponse<T>;
}

/**
 * Atomic Polling for "processing" transactions
 */
async function pollTransaction(ref: string, maxAttempts = 10): Promise<ApiResponse> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const res = await request(`verify.php?reference=${ref}`);
    if (res.status !== 'processing' && (res as any).data?.status !== 'processing' && (res as any).data?.status !== 'Pending') {
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

  register: async (
    name: string,
    email: string,
    phone: string,
    password: string,
    transactionPin: string,
    referralCode?: string,
    kycType?: string,
    bvn?: string,
    nin?: string
  ): Promise<User> => {
    const res = await request<{ token: string, user: User }>('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        transaction_pin: transactionPin,
        referral_code: referralCode || '',
        kyc_type: kycType || 'none',
        bvn: bvn || '',
        nin: nin || ''
      })
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

  // Forgot Password Flow
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return request('auth.php?action=forgot_password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  verifyResetCode: async (email: string, code: string): Promise<ApiResponse> => {
    return request('auth.php?action=verify_reset_code', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  },

  resetPassword: async (email: string, code: string, password: string): Promise<ApiResponse> => {
    return request('auth.php?action=reset_password', {
      method: 'POST',
      body: JSON.stringify({ email, code, password })
    });
  },

  // Dashboard Stats & Real-time Info
  getDashboardStats: async (): Promise<ApiResponse> => {
    return request('services.php?action=getDashboardStats', {
      method: 'POST'
    });
  },

  getVirtualAccounts: async (): Promise<ApiResponse> => {
    return request('services.php?action=getVirtualAccounts', {
      method: 'POST'
    });
  },

  createVirtualAccount: async (bvn: string, nin: string): Promise<ApiResponse> => {
    return request('services.php?action=createVirtualAccount', {
      method: 'POST',
      body: JSON.stringify({ bvn, nin })
    });
  },

  // Dynamic Lookups
  getAirtimeNetworks: async (): Promise<ApiResponse> => {
    return request('services.php?action=getAirtimeNetworks', {
      method: 'POST'
    });
  },

  getDataPlans: async (networkId: number | string): Promise<ApiResponse> => {
    return request('services.php?action=getDataPlans', {
      method: 'POST',
      body: JSON.stringify({ network_id: Number(networkId) })
    });
  },

  getCableProviders: async (): Promise<ApiResponse> => {
    return request('services.php?action=getCableProviders', {
      method: 'POST'
    });
  },

  getCablePlans: async (providerId: string): Promise<ApiResponse> => {
    return request('services.php?action=getCablePlans', {
      method: 'POST',
      body: JSON.stringify({ provider_id: providerId })
    });
  },

  getElectricityProviders: async (): Promise<ApiResponse> => {
    return request('services.php?action=getElectricityProviders', {
      method: 'POST'
    });
  },

  getExamProviders: async (): Promise<ApiResponse> => {
    return request('services.php?action=getExamProviders', {
      method: 'POST'
    });
  },

  getSmilePlans: async (): Promise<ApiResponse> => {
    return request('services.php?action=getSmilePlans', {
      method: 'POST'
    });
  },

  getKiraniPlans: async (): Promise<ApiResponse> => {
    return request('services.php?action=getKiraniPlans', {
      method: 'POST'
    });
  },

  getAlphaPlans: async (): Promise<ApiResponse> => {
    return request('services.php?action=getAlphaPlans', {
      method: 'POST'
    });
  },

  // Financial VTU Dispatching (Appended Query Parameter Routing)
  buyAirtime: async (network: number | string, amount: number, phone: string, pin: string) => {
    const res = await request('services.php?type=airtime', {
      method: 'POST',
      body: JSON.stringify({
        network: isNaN(Number(network)) ? network : Number(network),
        amount,
        phone,
        networktype: 'VTU',
        pin
      })
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }
    return res;
  },

  buyData: async (network: number | string, plan: number | string, phone: string, pin: string) => {
    const res = await request('services.php?type=data', {
      method: 'POST',
      body: JSON.stringify({
        network: isNaN(Number(network)) ? network : Number(network),
        plan: isNaN(Number(plan)) ? plan : Number(plan),
        phone,
        pin
      })
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }
    return res;
  },

  payCable: async (provider: string, customerId: string, plan: string, pin: string, amount = 0) => {
    const res = await request('services.php?type=bills', {
      method: 'POST',
      body: JSON.stringify({
        type: 'cable',
        provider,
        customer_id: customerId,
        amount,
        plan,
        pin
      })
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }
    return res;
  },

  payElectricity: async (provider: string, customerId: string, amount: number, pin: string) => {
    const res = await request('services.php?type=bills', {
      method: 'POST',
      body: JSON.stringify({
        type: 'electricity',
        provider,
        customer_id: customerId,
        amount,
        pin
      })
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }
    return res;
  },

  buyExamPin: async (provider: number | string, quantity: number, pin: string) => {
    const res = await request('services.php?type=exam', {
      method: 'POST',
      body: JSON.stringify({
        provider: isNaN(Number(provider)) ? provider : Number(provider),
        quantity,
        pin
      })
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }
    return res;
  },

  // Secure Wallet Funding (Online Payments)
  initializePayment: async (amount: number, gateway: string): Promise<ApiResponse> => {
    return request('fund.php', {
      method: 'POST',
      body: JSON.stringify({ amount, gateway })
    });
  },

  submitManualDeposit: async (
    reference: string,
    amount: number,
    senderName: string,
    senderBank: string,
    senderAccount: string,
    receiptBase64: string,
    receiptName: string
  ): Promise<ApiResponse> => {
    return request('fund.php?action=submit_manual', {
      method: 'POST',
      body: JSON.stringify({
        reference,
        amount,
        sender_name: senderName,
        sender_bank: senderBank,
        sender_account: senderAccount,
        receipt: receiptBase64,
        receipt_name: receiptName
      })
    });
  },

  // Unified Transaction History & Verification
  getTransactions: async (limit = 50, offset = 0, type?: string, status?: string): Promise<Transaction[]> => {
    const body: any = { limit, offset };
    if (type) body.type = type;
    if (status) body.status = status;

    const res = await request<Transaction[]>('services.php?action=getTransactions', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return res.data || [];
  },

  verifyTransaction: async (referenceId: string): Promise<ApiResponse> => {
    return request(`verify.php?reference=${referenceId}`, {
      method: 'GET'
    });
  },

  // Backwards compatibility/support for local or requested service logs
  addRequest: async (req: any) => {
    return request('services.php?action=add_request', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  },

  getRequests: async (): Promise<any[]> => {
    const res = await request<any[]>('services.php?action=get_requests', {
      method: 'POST'
    });
    return res.data || [];
  },

  // performService for legacy features Compatibility
  performService: async (serviceData: any): Promise<ApiResponse> => {
    const { action, ...rest } = serviceData;
    const res = await request(`services.php?action=${action || 'perform'}`, {
      method: 'POST',
      body: JSON.stringify(rest)
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }

    return res;
  },

  // Alpha Topup Compatibility
  buyAlpha: async (phone: string, plan: number | string, pin: string) => {
    return api.performService({
      action: 'alpha',
      phone,
      plan: Number(plan),
      pin
    });
  },

  // Kirani Service Compatibility
  buyKirani: async (phone: string, plan: number | string, pin: string) => {
    return api.performService({
      action: 'kirani',
      phone,
      plan: Number(plan),
      pin
    });
  },

  // Smile Services Compatibility
  buySmile: async (accountId: string, accountType: string, serviceType: string, plan: number | string, pin: string) => {
    return api.performService({
      action: 'smile',
      account_id: accountId,
      account_type: accountType,
      service_type: serviceType,
      plan: Number(plan),
      pin
    });
  },

  // Airtime to Cash Compatibility
  submitA2C: async (network: string, phone: string, amount: number) => {
    return api.performService({
      action: 'a2c',
      network,
      phone,
      amount
    });
  },

  // Add transaction Compatibility
  addTransaction: async (tx: any) => {
    return api.performService({
      action: 'transfer',
      ...tx
    });
  },

  // buyService helper Compatibility (CAC, ESim, IntlTopup)
  buyService: async (action: string, amount: number, details: any = {}) => {
    return api.performService({
      action,
      amount,
      ...details
    });
  },

  // Backwards compatibility for non-documented endpoints if requested
  changePassword: async (currentPassword: string, newPassword: string) => {
    return request('services.php?action=change_password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  changePin: async (currentPin: string, newPin: string) => {
    return request('services.php?action=change_pin', {
      method: 'POST',
      body: JSON.stringify({ currentPin, newPin })
    });
  },

  forgotPin: async () => {
    return request('services.php?action=forgot_pin', {
      method: 'POST'
    });
  },

  updateUser: async (data: any) => {
    return request('services.php?action=update_profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getUser: async (): Promise<User | null> => {
    // For compatibility with the legacy components, we return the dashboard stats mapped into User.
    const res = await api.getDashboardStats();
    if (res.success && res.data) {
      const stats = res.data;
      const cached = localStorage.getItem('saukiglobal_data');
      const cachedUser = cached ? JSON.parse(cached) : {};
      
      const balance = stats.wallet?.balance !== undefined ? Number(stats.wallet.balance) : (cachedUser.balance || 0);
      const commissionBalance = stats.wallet?.referral_commission !== undefined ? Number(stats.wallet.referral_commission) : (cachedUser.commissionBalance || 0);

      return {
        ...cachedUser,
        balance,
        commissionBalance,
        isReseller: stats.tier === 'Reseller' || stats.tier === 'Reseller Pro',
        kycStatus: stats.kyc_status,
        tier: stats.tier
      } as User;
    }
    return null;
  },

  getRatelPlans: async (): Promise<ApiResponse> => {
    try {
      const res = await request<any>('services.php?action=getRatelPlans', {
        method: 'POST'
      });
      if (res.success && res.data) {
        return res;
      }
    } catch (err) {
      console.warn("Failed to retrieve Ratel plans from backend, using fallback configuration.", err);
    }
    return {
      success: true,
      message: 'Ratel plans retrieved (Fallback)',
      status: 'success',
      data: {
        "10": { "plan_id": "8", "user_price": 100.00, "agent_price": 95.00, "vendor_price": 90.00, "buying_price": 80.00 },
        "20": { "plan_id": "9", "user_price": 200.00, "agent_price": 190.00, "vendor_price": 180.00, "buying_price": 160.00 },
        "30": { "plan_id": "10", "user_price": 300.00, "agent_price": 285.00, "vendor_price": 270.00, "buying_price": 240.00 },
        "60": { "plan_id": "11", "user_price": 600.00, "agent_price": 570.00, "vendor_price": 540.00, "buying_price": 480.00 }
      }
    };
  },

  buyRatel: async (phone: string, duration: number, network: string, pin: string): Promise<ApiResponse> => {
    const res = await request('services.php?type=ratel_call', {
      method: 'POST',
      body: JSON.stringify({
        phone,
        duration,
        network,
        pin
      })
    });

    if (res.status === 'processing' && (res.data as any)?.reference) {
      return await pollTransaction((res.data as any).reference);
    }
    return res;
  },

  getNotifications: async (): Promise<ApiResponse<{ count: number, notifications: any[] }>> => {
    return request('notifications.php?action=list', {
      method: 'GET'
    });
  }
};
