import { create } from 'zustand';
import { PositionState } from '../interfaces';

// user position
export const usePositionStore = create<PositionState>((set) => ({
  userPosition: { lat: 22.9893754, lon: 120.1848423 }, // default TAINAN GOVERNMENT
  setUserPosition: (pos) => set({ userPosition: pos }),
}));