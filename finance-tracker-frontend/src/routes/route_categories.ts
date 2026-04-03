import { apiClient } from "@/utils/Error_handler";
import type { Category } from "@/types/interfaces";

interface CategoriesResponse {
  message: string;
  data: Category[];
}

export const fetchCategoriesRoute = async () => {
  const data = await apiClient<CategoriesResponse>(
    "/api/category/get-system-categories",
    {
      method: "GET",
    }
  );
  if (data.error) throw new Error(data.error.message);
  return data.result;
};