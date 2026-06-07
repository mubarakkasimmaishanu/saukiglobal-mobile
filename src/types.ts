export type Network = 'mtn' | 'airtel' | 'glo' | '9mobile';
export type AccountTier = 'basic' | 'reseller';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  balance: number;
  referralCode: string;
  isReseller: boolean;
  // Commission & Tier fields
  commissionBalance?: number;
  totalEarnings?: number;
  totalReferrals?: number;
  upgradeDate?: string;
  address?: string;
  dob?: string;
  tier?: string;
}

export interface Transaction {
  id: string;
  type: 'Airtime' | 'Data' | 'Transfer' | 'Electricity' | 'Cable' | 'Exam' | 'NIN' | 'Funding' | 'Ratel_call' | 'Ratel';
  amount: number;
  status: 'Success' | 'Pending' | 'Processing' | 'Failed';
  date: string;
  details: string;
  recipient?: string;
  network?: string;
  profit?: number; // Reseller profit margin
}

export interface DataPlan {
  id: string;
  size: string;
  type: string;
  validity: string;
  retail: number;
  reseller: number;
}

export interface ServiceRequest {
  id: string;
  service: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Error';
  price: number;
  details: string;
}
