import { apiClient } from "@/utils/Error_handler";
import type { Category } from "@/types/interfaces";

interface CategoriesResponse {
  message: string;
  data: Category[];
}

export const fetchCategoriesRoute = async () => {
  const res = await apiClient<CategoriesResponse>(
    "/api/category/get-system-categories",
    {
      method: "GET",
    }
  );
  if (res.error) throw new Error(res.error.message);
  return res.result;
};
