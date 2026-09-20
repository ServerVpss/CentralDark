import { useCallback } from "react";

export function useToast() {
  const toast = useCallback(
    ({ title, description }: { title?: string; description?: string; variant?: string }) => {
      console.log("[toast]", title, description);
    },
    [],
  );
  return { toast };
}
