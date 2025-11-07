import { create } from "zustand";
export interface dashUser {
  username: string;
  streak: number;
}



interface DashboardState {
  dashboardData: dashUser[] | null; 
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
      type DashboardApiResponse = { message: string; dashboard: dashUser[]; };
      const data: DashboardApiResponse = await response.json();
      set({ dashboardData: data.dashboard });
    } catch (error: unknown) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  clearDashboardData: () => set({ dashboardData: null, error: null }),
}));
