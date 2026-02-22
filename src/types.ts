export type Network = 'mtn' | 'airtel' | 'glo' | '9mobile';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  balance: number;
  referralCode: string;
  isReseller: boolean;
}

export interface Transaction {
  id: string;
  type: 'Airtime' | 'Data' | 'Transfer' | 'Electricity' | 'Cable' | 'Exam' | 'NIN' | 'Funding';
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  details: string;
  recipient?: string;
  network?: string;
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
