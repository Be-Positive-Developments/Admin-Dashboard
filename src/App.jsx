import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { router } from "@/routes";
import { ThemeProvider } from "@/components/ThemeProvider";
import queryClient from "@/lib/queryClient";
import { registerTab } from "@/lib/sessionManager";

export default function App() {
  // Register this tab for multi-tab session tracking.
  // beforeunload handles tab-count updates during actual tab close/refresh.
  useEffect(() => {
    const cleanup = registerTab();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <RouterProvider router={router} />
        <Toaster closeButton position="top-center" richColors theme="system" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
