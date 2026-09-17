import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthRepository } from '../repositories/AuthRepository.ts';

interface AdminAuthState {
  authenticated: boolean | null; // null = session check still in flight
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    AuthRepository.getSession().then((session) => setAuthenticated(session.authenticated));
  }, []);

  async function login(password: string) {
    const session = await AuthRepository.login(password);
    setAuthenticated(session.authenticated);
  }

  async function logout() {
    await AuthRepository.logout();
    setAuthenticated(false);
  }

  return (
    <AdminAuthContext.Provider value={{ authenticated, login, logout }}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
