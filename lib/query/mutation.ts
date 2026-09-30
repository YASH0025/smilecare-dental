"use client";

import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api/client";

type Msg<TData, TVars> = string | ((data: TData, vars: TVars) => string) | null;

/**
 * useMutation with the app's conventions baked in:
 * - invalidates the given query-key prefixes on success (no manual refetching / router.refresh)
 * - success toast (optional) and an error toast with the server's message
 * Callers using `mutateAsync` should still wrap in try/catch to keep dialogs open on failure.
 */
export function useApiMutation<TVars, TData = unknown, TContext = unknown>({
  mutationFn,
  invalidate = [],
  success = null,
  toastError = true,
  ...rest
}: {
  mutationFn: (vars: TVars) => Promise<TData>;
  invalidate?: QueryKey[] | ((data: TData, vars: TVars) => QueryKey[]);
  success?: Msg<TData, TVars>;
  /** Set false when the caller renders the error inline (e.g. the login form). */
  toastError?: boolean;
} & Omit<UseMutationOptions<TData, Error, TVars, TContext>, "mutationFn">) {
  const qc = useQueryClient();
  return useMutation<TData, Error, TVars, TContext>({
    mutationFn,
    ...rest,
    onSuccess: async (data, vars, ctx, mctx) => {
      const keys = typeof invalidate === "function" ? invalidate(data, vars) : invalidate;
      await Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));
      if (success) toast.success(typeof success === "function" ? success(data, vars) : success);
      await rest.onSuccess?.(data, vars, ctx, mctx);
    },
    onError: (error, vars, ctx, mctx) => {
      if (toastError) toast.error(errorMessage(error));
      rest.onError?.(error, vars, ctx, mctx);
    },
  });
}
