"use client";

import React from "react";

function LoadingProduct() {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <div className="bg-gray-300 h-64 w-full rounded-lg"></div>
        </div>

        <div className="md:w-1/2 space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
            <div className="h-8 w-16 bg-gray-300 rounded-md"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
          </div>

          <div className="h-10 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <div className="mt-8">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="bg-gray-200 p-4 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingProduct;
