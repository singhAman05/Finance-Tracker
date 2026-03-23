import { fetchCategoriesRoute } from "@/routes/route_categories";
import type { Category } from "@/types/interfaces";


// Fetch all categories
export const fetchCategories = async ()=> {
  const result = await fetchCategoriesRoute();
  return result;
};

// Filter categories by type
export const filterCategoriesByType = (
  categories: Category[],
  type: "income" | "expense"
): Category[] => {
  return categories.filter((cat) => cat.type === type);
};