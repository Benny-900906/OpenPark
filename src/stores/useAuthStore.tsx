// src/stores/useAuthStore.ts
// stores tdx accessToken in sessionStorage 
// accessToken fetched on mount when the user opens the app
// accessToken gets updated every 4 hours (logic in App.tsx)
import { create } from 'zustand';
import { getAccessToken } from '../lib/tdxServices';
import { AuthState } from '../interfaces';
import { useLoadingStore } from './useLoadingStore';
import { useRequestingTokenStore } from './useRequestingTokenStore';

// access token
export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem('access_token'),

  setToken: (token) => {
    sessionStorage.setItem('access_token', token);
    set({ token });
  },

  fetchToken: async () => {
    const setLoading = useLoadingStore.getState().setLoading;
    const setRequestingToken = useRequestingTokenStore.getState().setRequestingToken;
    setLoading(true);
    setRequestingToken(true);
    try {
      const accessToken : string = await getAccessToken();
      sessionStorage.setItem('access_token', accessToken);
      set({ token: accessToken });
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
    setLoading(false);
    setRequestingToken(false);
  },
}));
