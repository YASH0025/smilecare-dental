"use client";

import * as React from "react";
import { PAGE_SIZE } from "@/lib/constants";

/** Client-side pagination that resets when the filtered list changes size. */
export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, pageCount, pageItems, total: items.length, pageSize };
}
