"use client";

import React, { memo } from "react";
import Image from "next/image";
import { Product } from "../type/type";

interface CartItem extends Product {
  quantity: number;
}

interface CartItemRowProps {
  item: CartItem;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
}

const CartItemRow = memo(function CartItemRow({
  item,
  removeFromCart,
  updateQuantity,
}: CartItemRowProps) {
  return (
    <div
      key={item.id}
      className="flex flex-col md:flex-row items-start md:items-center justify-between border-b py-4 gap-4 w-full"
    >
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-20 h-20 relative flex-shrink-0 md:w-28 md:h-28">
          <Image
            src={item.images[0]}
            alt={item.title}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <div className="flex-grow flex flex-col md:flex-row md:items-center md:justify-between w-full min-w-0">
          <h2 className="text-lg font-semibold dark:text-white mb-1 md:mb-0 max-w-full truncate">
            {item.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 md:ml-4 flex-shrink-0">
            Цена: ${item.price.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-4 w-full md:w-auto mt-2 md:mt-0">
        <div className="flex items-center">
          <label
            htmlFor={`quantity-${item.id}`}
            className="mr-2 text-white font-semibold flex-shrink-0"
          >
            Количество:
          </label>
          <input
            id={`quantity-${item.id}`}
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              updateQuantity(item.id, isNaN(value) || value < 1 ? 1 : value);
            }}
            className="w-16 p-1 border rounded-md text-center dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 flex-shrink-0"
          />
        </div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 dark:bg-red-700 flex-shrink-0"
        >
          Удалить
        </button>
      </div>

      <p className="text-xl font-bold dark:text-white flex-shrink-0 mt-2 md:mt-0">
        ${(item.price * item.quantity).toFixed(2)}
      </p>
    </div>
  );
});

export default CartItemRow;
