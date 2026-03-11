import { QueryClient } from "@tanstack/react-query";

/**
 * A single QueryClient instance shared across the entire app via
 * QueryClientProvider in App.jsx.
 *
 * Default configuration:
 * - staleTime 5 min  → cached data is considered fresh for 5 minutes
 *                       before a background refetch is triggered.
 * - gcTime    10 min → inactive query data is garbage-collected after
 *                       10 minutes (formerly cacheTime in v4).
 * - retry     1      → failed requests are retried once before an error
 *                       is surfaced to the UI.
 * - refetchOnWindowFocus false → prevents an automatic refetch every time
 *                       the user switches browser tabs.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
