import { create } from 'zustand';
import { PositionState } from '../interfaces';

// user position
export const usePositionStore = create<PositionState>((set) => ({
  userPosition: { lat: 22.9902930, lon: 120.1847992 }, // default TAINAN GOVERNMENT
  setUserPosition: (pos) => set({ userPosition: pos }),
}));