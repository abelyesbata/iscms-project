import { createContext, useContext } from 'react';

// Create the context here (not in AuthContext.jsx)
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}