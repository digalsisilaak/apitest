"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (newTheme: Theme) => {
        set({ theme: newTheme });

        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          if (newTheme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";

          if (typeof window !== "undefined") {
            const root = window.document.documentElement;
            if (newTheme === "dark") {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
          return { theme: newTheme };
        });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (typeof window !== "undefined") {
            const root = window.document.documentElement;
            if (state.theme === "dark") {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        }
      },
    }
  )
);

export default useThemeStore;
