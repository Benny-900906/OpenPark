import { create } from 'zustand';

type Position = {
  lat: number;
  lon: number;
};

type PositionState = {
  userPosition: Position;
  setUserPosition: (pos: Position) => void;
};

export const usePositionStore = create<PositionState>((set) => ({
  userPosition: { lat: 22.9893754, lon: 120.1848423 }, // default TAINAN GOVERNMENT
  setUserPosition: (pos) => set({ userPosition: pos }),
}));