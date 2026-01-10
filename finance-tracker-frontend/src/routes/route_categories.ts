import { apiClient } from "@/utils/Error_handler";

export const fetchCategoriesRoute = async()=>{
  const data = await apiClient<any>(
        `/api/accounts/fetch-accounts`,
        {
            method: "GET",
        }
    )
  return data.result
}