export function useToast() {
  return {
    toast: ({ title, description }: { title?: string; description?: string; variant?: string }) => {
      console.log("[toast]", title, description);
    },
  };
}
