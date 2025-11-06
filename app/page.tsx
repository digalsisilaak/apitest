"use client";

import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useInfiniteProducts, useAllCategory } from "./main/lib/apiFetch";
import Dropdown from "./main/component/Dropdown";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import InputMain from "./main/component/inputMain";
import GridTable from "./main/component/gridTable";

const Main = memo(function Main() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [inputSearchTerm, setInputSearchTerm] = useState("");
  const [queryTerm, setQueryTerm] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get("q");
    if (q) {
      setInputSearchTerm(q);
      setQueryTerm(q);
    } else {
      setInputSearchTerm("");
      setQueryTerm("");
    }
  }, [pathname]);

  const handleSearch = useCallback(() => {
    setQueryTerm(inputSearchTerm);
    const searchParams = new URLSearchParams(window.location.search);
    if (inputSearchTerm) {
      searchParams.set("q", inputSearchTerm);
    } else {
      searchParams.delete("q");
    }
    router.push(`${pathname}?${searchParams.toString()}`);
    queryClient.invalidateQueries({ queryKey: ["infiniteProducts"] });
  }, [pathname, inputSearchTerm, queryClient, router]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      queryClient.invalidateQueries({ queryKey: ["infiniteProducts"] });
    },
    [queryClient]
  );

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const { data: categoryData } = useAllCategory();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteProducts(selectedCategory, queryTerm);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data && hasNextPage && !isLoading && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [data, hasNextPage, isLoading, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverTarget = observerTarget.current;

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="p-4 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-3xl font-bold mb-6  dark:text-gray-100">
          Наши Продукты
        </h1>
        <InputMain
          inputSearchTerm={inputSearchTerm}
          handleKeyDown={handleKeyDown}
          handleSearch={handleSearch}
          setInputSearchTerm={setInputSearchTerm}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <Dropdown
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          categoryData={categoryData}
        />
        <div className="w-full">
          {isLoading ? (
            <p className="p-4 text-center dark:text-gray-200">
              Загрузка продуктов...
            </p>
          ) : isError ? (
            <p className="p-4 text-center text-red-500">
              Ошибка: {error?.message}
            </p>
          ) : (
            <>
              <GridTable data={data} />
              <div ref={observerTarget} className="h-1"></div>
              {isFetchingNextPage && (
                <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
                  Загрузка...
                </p>
              )}
              {!hasNextPage && data?.pages && data.pages.length > 0 && (
                <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
                  Все продукты загружены!
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {!isLoading && data?.pages && data.pages.length === 0 && (
        <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
          Товаров нет
        </p>
      )}
    </div>
  );
});

export default Main;
