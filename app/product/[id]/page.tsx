"use client";
import React, { useState } from "react";
import { useProductDetails } from "../../main/lib/apiFetch";
import Image from "next/image";
import LoadingProduct from "./loading";
import { useCartStore } from "../../main/lib/cartStore";
import { useNotifCon } from "@/main/lib/NotifContext";
import Link from "next/link";
import ProtectedRoute from "../../main/component/ProtectedRoute";

interface PageProps {
  params: { id: string };
}

function Product({ params }: PageProps) {
  const { addNotification } = useNotifCon();

  const { id } = params;
  const [quantity, setQuantity] = useState(1);

  const { data: product, isError, error, isLoading } = useProductDetails(id);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  if (isLoading) {
    return <LoadingProduct />;
  }
  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return product ? (
    <div className="px-4 py-4 dark:bg-gray-900 min-h-screen">
      <div className="mb-2">
        <Link
          href="/"
          className="text-blue-500 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300"
        >
          Вернуться назад
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <div className="bg-gray-200 dark:bg-gray-700 w-full aspect-square max-w-sm mx-auto flex items-center justify-center rounded-lg overflow-hidden relative">
            <Image
              src={product.images[0]}
              alt={product.title}
              layout="fill"
              objectFit="contain"
              className="object-center"
            />
          </div>
        </div>

        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold dark:text-white">
            {product.title}
          </h1>

          <p className="text-gray-700 dark:text-gray-300">
            {product.description}
          </p>

          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            ${product.price}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={decrementQuantity}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-1 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              min="1"
            />
            <button
              onClick={incrementQuantity}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-1 px-3 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              +
            </button>
          </div>

          <button
            onClick={() => {
              addToCart({ ...product, quantity: quantity });
              addNotification(`добавлено в корзину ${product.title}`);
            }}
            disabled={!product}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Добавить в корзину
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 dark:text-white">
          Product Reviews
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-semibold dark:text-white">John Doe</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              October 10, 2025
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              This product is amazing! I highly recommend it.
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-semibold dark:text-white">Jane Smith</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              October 9, 2025
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Good quality and fast shipping
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default function ProtectedProductPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <Product params={params} />
    </ProtectedRoute>
  );
}
