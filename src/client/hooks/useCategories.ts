import { useShallow } from "zustand/react/shallow";
import { useCategoryStore } from "@/store/categoryStore";
import type { Category } from "@/shared/types";

export function useCategories() {
  const categories = useCategoryStore(useShallow((s) => s.categories));
  const isLoaded = useCategoryStore(useShallow((s) => s.isLoaded));
  const load = useCategoryStore(useShallow((s) => s.load));
  const addCategory = useCategoryStore(useShallow((s) => s.addCategory));
  const renameCategory = useCategoryStore(useShallow((s) => s.renameCategory));
  const deleteCategory = useCategoryStore(useShallow((s) => s.deleteCategory));

  function byType(type: "income" | "expense"): Category[] {
    return categories.filter((c) => c.type === type && !c.isDeleted);
  }

  return {
    categories,
    isLoaded,
    load,
    addCategory,
    renameCategory,
    deleteCategory,
    byType,
  };
}
