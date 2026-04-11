"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { QUERY_DEFAULTS } from "@/consts";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(
    process.env.NODE_ENV !== "development",
  );

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@/lib/msw-init").then(({ initMSW }) =>
        initMSW().then(() => setMswReady(true)),
      );
    }
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_DEFAULTS.staleTimeMs,
            retry: QUERY_DEFAULTS.retry,
            refetchOnWindowFocus: QUERY_DEFAULTS.refetchOnWindowFocus,
          },
        },
      }),
  );

  if (!mswReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
