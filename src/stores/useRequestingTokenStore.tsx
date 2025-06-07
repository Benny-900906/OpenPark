// request access token (state)
import { create } from 'zustand';

interface RequestingTokenState {
  requestingToken: boolean;
  setRequestingToken: (requestingToken: boolean) => void;
}

export const useRequestingTokenStore = create<RequestingTokenState>((set) => ({
  requestingToken: false,
  setRequestingToken: (requestingToken) => set({ requestingToken: requestingToken }),
}));