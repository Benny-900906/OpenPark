// search nearby parking spots (state)
import { create } from 'zustand';

interface SearchingState {
  searching: boolean;
  setSearching: (searching: boolean) => void;
}

export const useSearchingStore = create<SearchingState>((set) => ({
  searching: false,
  setSearching: (searching) => set({ searching: searching }),
}));