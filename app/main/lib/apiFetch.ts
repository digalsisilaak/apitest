import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface FetchProductsArgs {
  limit: number;
  skip: number;
  category?: string;
  searchQuery?: string;
}

export const fetchProductData = async (id: string) => {
  const response = await fetch(`https://dummyjson.com/products/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductData(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  });
};

const fetchProducts = async ({
  limit,
  skip,
  category,
  searchQuery,
}: FetchProductsArgs) => {
  let url = "https://dummyjson.com/products";

  if (searchQuery) {
    url = `https://dummyjson.com/products/search?q=${searchQuery}`;
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (skip) params.append("skip", skip.toString());

    if (params.toString()) {
      url += `&${params.toString()}`;
    }
  } else if (category) {
    url = `https://dummyjson.com/products/category/${category}`;
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (skip) params.append("skip", skip.toString());
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  } else {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (skip) params.append("skip", skip.toString());
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const useInfiniteProducts = (
  selectedCategory?: string,
  searchQuery?: string
) => {
  return useInfiniteQuery({
    queryKey: ["infiniteProducts", selectedCategory, searchQuery],
    queryFn: ({ pageParam = 0 }) =>
      fetchProducts({
        limit: pageParam === 0 ? 25 : 15,
        skip: pageParam,
        category: selectedCategory,
        searchQuery: searchQuery,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentTotal = allPages.reduce(
        (acc, page) => acc + page.products.length,
        0
      );
      if (currentTotal < lastPage.total) {
        return allPages.length === 1 ? 25 : currentTotal;
      }
      return undefined;
    },
    staleTime: Infinity,
  });
};

async function fetchAllCategory() {
  const response = await fetch("https://dummyjson.com/products/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

export const useAllCategory = () => {
  return useQuery({
    queryKey: ["AllCategory"],
    queryFn: () => fetchAllCategory(),
    staleTime: Infinity,
  });
};
