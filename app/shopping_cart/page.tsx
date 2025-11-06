"use client";

import React, { memo, useMemo, useState } from "react";
import { useCartStore } from "../main/lib/cartStore";
import { usePurchaseHistoryStore } from "../main/lib/purchaseHistoryStore";
import Link from "next/link";
import CartItemRow from "./CartItemRow";
import ProtectedRoute from "@/main/component/ProtectedRoute";
import { useAuth } from "../main/lib/AuthContext";
import { HistoryItem } from "../type/type";

const ShoppingCartPage = memo(function ShoppingCartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const { addToPurchaseHistory } = usePurchaseHistoryStore();
  const { isLoggedIn } = useAuth();
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const calculateTotal = useMemo(() => {
    return cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  }, [cart]);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      setPurchaseMessage("Пожалуйста, войдите, чтобы оформить заказ.");
      setTimeout(() => setPurchaseMessage(null), 5000);
      return;
    }

    if (cart.length > 0) {
      try {
        const historyItems: HistoryItem[] = cart.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          thumbnail: item.thumbnail,
          timestamp: item.timestamp || Date.now(),
        }));
        await addToPurchaseHistory(historyItems);
        clearCart();
        setPurchaseMessage("Ваш заказ успешно оформлен!");
        setTimeout(() => setPurchaseMessage(null), 5000);
      } catch (error) {
        console.error("Ошибка при оформлении заказа:", error);
        setPurchaseMessage("Произошла ошибка при оформлении заказа.");
        setTimeout(() => setPurchaseMessage(null), 5000);
      }
    } else {
      setPurchaseMessage("Ваша корзина пуста, невозможно оформить заказ.");
      setTimeout(() => setPurchaseMessage(null), 5000);
    }
  };

  return (
    <div className="px-4 py-4 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Ваша корзина</h1>
      {purchaseMessage && (
        <div
          className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{purchaseMessage}</span>
        </div>
      )}
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-4">
            Ваша корзина пуста.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Добавьте товары, чтобы начать покупки!
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Вернуться в магазин
          </Link>
        </div>
      ) : (
        <div className="flex flex-col p-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
          {cart.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
            />
          ))}
          <div className="flex flex-col items-center md:flex-row md:justify-end md:items-center gap-4 mt-8">
            <h2 className="text-2xl font-bold dark:text-white md:mr-4">
              Общая сумма: ${calculateTotal}
            </h2>
            <button
              onClick={handlePurchase}
              className="w-full md:w-auto px-6 py-3 md:px-4 md:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Оформить заказ
            </button>
          </div>
          <Link
            href="/"
            className="mt-4 md:mt-2 text-blue-600 dark:text-blue-500 hover:underline md:text-right block"
          >
            Продолжить покупки
          </Link>
        </div>
      )}
    </div>
  );
});

export default function ProtectedShoppingCartPage() {
  return (
    <ProtectedRoute>
      <ShoppingCartPage />
    </ProtectedRoute>
  );
}
