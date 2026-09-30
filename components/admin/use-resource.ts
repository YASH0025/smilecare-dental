"use client";

import * as React from "react";
import type { CmsResource } from "@/lib/query/keys";
import { useCollectionMutations } from "@/lib/query";

/**
 * Promise-style create/update/delete helpers for CMS collections, built on
 * TanStack Query mutations (toasts + cache invalidation handled centrally).
 */
export function useResource(resource: CmsResource, label: string) {
  const { save, patch, remove } = useCollectionMutations(resource, label);

  return {
    save: React.useCallback((id: string | undefined, data: unknown) => save.mutateAsync({ id, data }), [save]),
    patch: React.useCallback(
      (id: string, data: Record<string, unknown>, message: string) => patch.mutateAsync({ id, data, message }).catch(() => undefined),
      [patch],
    ),
    remove: React.useCallback((id: string) => remove.mutateAsync(id), [remove]),
    isSaving: save.isPending,
  };
}
