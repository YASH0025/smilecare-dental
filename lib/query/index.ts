/**
 * TanStack Query layer. Client components read and write data ONLY through these hooks:
 *   component → hook → lib/api/client (fetch) → Route Handler → service → repository → JSON
 */
export * from "./keys";
export * from "./combine";
export * from "./mutation";
export * from "./appointments";
export * from "./patients";
export * from "./clinical";
export * from "./billing";
export * from "./cms";
export * from "./system";
export * from "./lookups";
