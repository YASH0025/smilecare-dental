"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiClientError } from "@/lib/api/client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Don't retry client errors (validation, 404, 401…); retry network/server errors once.
        retry: (count, error) => !(error instanceof ApiClientError && error.status >= 400 && error.status < 500) && count < 1,
      },
      mutations: { retry: false },
    },
  });
}

/** One QueryClient per browser session (created lazily so it's never shared between SSR requests). */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
}
