import { create } from "zustand";

interface StreakState {
  currentStreak: number;
  setStreak: (streak: number) => void;
}

const useStreakStore = create<StreakState>()((set) => ({
  currentStreak: 0,
  setStreak: (streak: number) => set({ currentStreak: streak }),
}));

export default useStreakStore;
