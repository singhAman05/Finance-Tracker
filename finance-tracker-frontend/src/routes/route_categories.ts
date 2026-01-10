import { apiClient } from "@/utils/Error_handler";

export const fetchCategoriesRoute = async()=>{
  const data = await apiClient<any>(
        `/api/category/get-system-categories`,
        {
            method: "GET",
        }
    )
  return data.result
}