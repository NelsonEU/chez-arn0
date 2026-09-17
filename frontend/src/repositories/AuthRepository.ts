import { getCsrfToken } from './csrf.ts';

export interface Session {
  authenticated: boolean;
}

export const AuthRepository = {
  async getSession(signal?: AbortSignal): Promise<Session> {
    const response = await fetch('/api/admin/session/', { credentials: 'same-origin', signal });
    return response.json();
  },

  async login(password: string, signal?: AbortSignal): Promise<Session> {
    const response = await fetch('/api/admin/login/', {
      method: 'POST',
      credentials: 'same-origin',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      throw new Error('Mot de passe invalide.');
    }
    return response.json();
  },

  async logout(signal?: AbortSignal): Promise<void> {
    await fetch('/api/admin/logout/', {
      method: 'POST',
      credentials: 'same-origin',
      signal,
      headers: { 'X-CSRFToken': getCsrfToken() },
    });
  },
};
