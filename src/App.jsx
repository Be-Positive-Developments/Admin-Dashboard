import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/routes";
import { ThemeProvider } from "@/components/ThemeProvider";
import queryClient from "@/lib/queryClient";
import { registerTab } from "@/lib/sessionManager";

export default function App() {
  // Register this tab for multi-tab session tracking.
  // On unmount / browser close the cleanup decrements the tab counter
  // and fires a logout beacon when the last tab closes (if not "remember me").
  useEffect(() => {
    const cleanup = registerTab();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
