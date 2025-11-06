"use client";
import React, { useEffect } from "react";
import { usePurchaseHistoryStore } from "@/main/lib/purchaseHistoryStore";
import { useAuth } from "../main/lib/AuthContext";
import ProtectedRoute from "../main/component/ProtectedRoute";

const MyAccountPage: React.FC = () => {
  const {
    purchaseHistory,
    fetchPurchaseHistory,
    setPurchaseHistory,
    resetPurchaseHistory,
    hasMore,
    isLoading,
  } = usePurchaseHistoryStore();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      resetPurchaseHistory();
      fetchPurchaseHistory();
    } else {
      setPurchaseHistory([]);
    }
  }, [
    isLoggedIn,
    fetchPurchaseHistory,
    setPurchaseHistory,
    resetPurchaseHistory,
  ]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}:${month}:${day} ${hours}:${minutes}`;
  };

  const handleLoadMore = () => {
    fetchPurchaseHistory();
  };

  return (
    <ProtectedRoute>
      <div className="px-4 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center mt-5 gap-5">
          <h1 className="text-2xl font-bold dark:text-white">Мой Кабинет</h1>
          <button
            onClick={logout}
            className="bg-red-500 px-2 py-[0.5] text-white rounded-md hover:bg-red-600"
          >
            Выйти
          </button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-bold">
          Ваш никнейм : {user?.username}
        </p>
        <div className="mt-5">
          <h1 className="text-xl mb-4 dark:text-white">Мои избранные товары</h1>
          {purchaseHistory.length === 0 && !isLoading && (
            <p className="text-gray-700 dark:text-gray-300">
              У вас пока нет избранных товаров.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {purchaseHistory.map((purchaseProduct) => (
              <div
                key={purchaseProduct.id}
                className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-md bg-white dark:bg-gray-800"
              >
                <h2 className="text-lg font-semibold dark:text-white">
                  {purchaseProduct.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  ${purchaseProduct.price}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Время покупки: {formatTimestamp(purchaseProduct.timestamp)}
                </p>
              </div>
            ))}
          </div>
          {isLoading && (
            <p className="text-center text-gray-700 dark:text-gray-300 mt-4">
              Загрузка...
            </p>
          )}
          {hasMore && !isLoading && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Загрузить ещё
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyAccountPage;
