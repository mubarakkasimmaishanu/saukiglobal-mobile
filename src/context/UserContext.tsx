import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await api.getUser();
      // Robust mapping for legacy data structures
      if (userData) {
        if (!userData.firstName && (userData as any).name) {
          const parts = (userData as any).name.split(' ');
          userData.firstName = parts[0] || 'User';
          userData.lastName = parts.slice(1).join(' ') || '';
        }
        // Ensure properties exist to prevent crashes
        userData.firstName = userData.firstName || 'User';
        userData.lastName = userData.lastName || '';
      }
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('saukiglobal_data');
    localStorage.removeItem('saukiglobal_token');
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
