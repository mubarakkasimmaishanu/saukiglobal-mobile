import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  setUserContext: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('saukiglobal_data');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  const setUserContext = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem('saukiglobal_data', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('saukiglobal_data');
    }
    setUser(newUser);
  };

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
        
        setUserContext(userData);
      } else {
        // If we get null back but we had a user, maybe the token expired or backend failed.
        // Don't auto-logout immediately unless we are sure it's an auth error.
        // For now, if we already have a user in state, we keep it.
      }
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
    setUserContext(null);
    api.logout();
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout, setUserContext }}>
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
