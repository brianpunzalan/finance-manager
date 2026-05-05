import { useUiStore } from "@/store/uiStore";
import type { ToastItem } from "@/shared/types";
import { useShallow } from "zustand/shallow";

export function useToast() {
  const toasts = useUiStore(useShallow((s) => s.toasts));
  const addToast = useUiStore(useShallow((s) => s.addToast));
  const removeToast = useUiStore(useShallow((s) => s.removeToast));

  function toast(opts: Omit<ToastItem, "id">) {
    addToast(opts);
  }

  return { toasts, toast, removeToast };
}
