/**
 * Axios API Client
 *
 * Central HTTP client for all backend requests.
 * Automatically attaches Clerk session token to every request.
 * Handles 401 (redirect to sign-in) and 429 (rate limit toast).
 */

import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach Clerk token ──────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  try {
    if (typeof window !== 'undefined') {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // No Clerk session available — continue without auth header
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Redirect to sign-in — only in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }

    if (status === 429) {
      toast.error('Too many requests. Please slow down and try again.');
    }

    return Promise.reject(error);
  },
);

export { apiClient };
