import { create } from "zustand";

export interface dashUser {
  username: string;
  streak: number;
}

interface DashboardData {
  dashboard: dashUser[];
}

interface DashboardState {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: (showAll?: boolean) => Promise<void>;
  clearDashboardData: () => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  dashboardData: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async (showAll = false) => {
    set({ isLoading: true, error: null });
    try {
      const url = showAll
        ? "/backend/dashboard?all=true"
        : "/backend/dashboard";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      set({ dashboardData: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearDashboardData: () => set({ dashboardData: null, error: null }),
}));
