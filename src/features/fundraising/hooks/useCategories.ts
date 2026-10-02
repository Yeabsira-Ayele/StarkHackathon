import { CATEGORIES } from '../data/categories.data.ts';

export function useCategories() {
  return { data: CATEGORIES, isLoading: false };
}
