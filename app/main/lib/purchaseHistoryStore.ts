import { create } from "zustand";
import { HistoryItem } from "../../type/type";

interface PurchaseHistoryState {
  purchaseHistory: HistoryItem[];
  currentPage: number;
  itemsPerPage: number;
  hasMore: boolean;
  isLoading: boolean;
  addToPurchaseHistory: (products: HistoryItem[]) => Promise<void>;
  fetchPurchaseHistory: (page?: number, limit?: number) => Promise<void>;
  setPurchaseHistory: (history: HistoryItem[]) => void;
  resetPurchaseHistory: () => void;
}

export const usePurchaseHistoryStore = create<PurchaseHistoryState>()(
  (set, get) => ({
    purchaseHistory: [],
    currentPage: 0,
    itemsPerPage: 5,
    hasMore: true,
    isLoading: false,
    setPurchaseHistory: (history) => set({ purchaseHistory: history }),
    resetPurchaseHistory: () =>
      set({ purchaseHistory: [], currentPage: 0, hasMore: true }),
    addToPurchaseHistory: async (products) => {
      try {
        const response = await fetch("/backend/purchaseHistory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            products.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              thumbnail: item.thumbnail,
              timestamp: item.timestamp,
            }))
          ),
        });

        if (!response.ok) {
          throw new Error("Failed to add to purchase history");
        }
        get().resetPurchaseHistory();
        await get().fetchPurchaseHistory(1, get().itemsPerPage);
      } catch (error) {
        console.error("Error adding to purchase history:", error);
      }
    },
    fetchPurchaseHistory: async (
      page = get().currentPage + 1,
      limit = get().itemsPerPage
    ) => {
      set({ isLoading: true });
      try {
        const response = await fetch(
          `/backend/purchaseHistory?_page=${page}&_limit=${limit}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch purchase history");
        }
        const newHistoryItems: HistoryItem[] = await response.json();

        set((state) => ({
          purchaseHistory: state.purchaseHistory.concat(newHistoryItems),
          currentPage: page,
          hasMore: newHistoryItems.length === limit,
        }));
      } catch (error) {
        console.error("Error fetching purchase history:", error);
        set({ hasMore: false });
      } finally {
        set({ isLoading: false });
      }
    },
  })
);
