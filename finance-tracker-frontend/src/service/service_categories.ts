import { fetchSystemCategories } from "@/routes/route_categories";

// Define the category interface
export interface Category {
  id: string;
  name: string;
  type: string;
}

// Fetch all categories
export const fetchCategories = async ()=> {
  const result = await fetchSystemCategories();
  console.log(result);
  return result;
};

// Filter categories by type
export const filterCategoriesByType = (
  categories: Category[],
  type: "income" | "expense"
): Category[] => {
  return categories.filter((cat) => cat.type === type);
};