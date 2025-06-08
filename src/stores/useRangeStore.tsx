// useRangeStore.ts
import { create } from 'zustand';

interface RangeState {
  // what is the distance range from user's origin should the app fetch
  selectedDistanceRange: number
  setSelectedDistanceRange: (range: number) => void

  // how many results should the app fetch
  selectedResultRange: number
  setSelectedResultRange: (range: number) => void

  selectedParkingType: string
  setSelectedParkingType: (type: string) => void
};

export const useRangeStore = create<RangeState>((set) => ({
  selectedDistanceRange: 200,
  setSelectedDistanceRange: (range) => set({ selectedDistanceRange: range }),

  selectedResultRange: 20,
  setSelectedResultRange: (range) => set({ selectedResultRange: range }),

  selectedParkingType: '路邊停車位',
  setSelectedParkingType: (type) => set({ selectedParkingType : type })
}));