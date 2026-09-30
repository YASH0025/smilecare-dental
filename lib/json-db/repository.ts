import "server-only";
import { randomUUID } from "node:crypto";
import type { BaseEntity } from "@/types";
import { mutateJson, readJson, type DataFile } from "./store";

export type CreateInput<T extends BaseEntity> = Omit<T, "id" | "createdAt" | "updatedAt"> & { id?: string };
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;

export interface Repository<T extends BaseEntity> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  findOne(predicate: (item: T) => boolean): Promise<T | null>;
  findMany(predicate: (item: T) => boolean): Promise<T[]>;
  create(data: CreateInput<T>): Promise<T>;
  update(id: string, data: UpdateInput<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  /** Atomically run a read-check-write on the whole collection. */
  transaction<R>(fn: (items: T[]) => { items: T[]; result: R } | Promise<{ items: T[]; result: R }>): Promise<R>;
}

type IdFactory = (items: { id: string }[]) => string;

/** Sequential, human-friendly IDs such as `APT-1024` or `P-0019`. */
export function sequentialId(prefix: string, pad = 4): IdFactory {
  return (items) => {
    const max = items.reduce((acc, item) => {
      const n = Number(item.id.replace(`${prefix}-`, ""));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return `${prefix}-${String(max + 1).padStart(pad, "0")}`;
  };
}

export const uuidId: IdFactory = () => randomUUID().slice(0, 8);

/**
 * Generic collection repository backed by a JSON array file.
 * Swap this class for a Prisma-backed implementation with the same interface
 * to move to PostgreSQL without touching services, routes or UI.
 */
export function createJsonRepository<T extends BaseEntity>(file: DataFile, makeId: IdFactory = uuidId): Repository<T> {
  const all = () => readJson<T[]>(file);

  return {
    getAll: all,

    async getById(id) {
      return (await all()).find((item) => item.id === id) ?? null;
    },

    async findOne(predicate) {
      return (await all()).find(predicate) ?? null;
    },

    async findMany(predicate) {
      return (await all()).filter(predicate);
    },

    async create(data) {
      return mutateJson<T[], T>(file, (items) => {
        const now = new Date().toISOString();
        const { id: requestedId, ...rest } = data;
        const entity = {
          ...rest,
          id: requestedId && !items.some((i) => i.id === requestedId) ? requestedId : makeId(items),
          createdAt: now,
          updatedAt: now,
        } as T;
        return { next: [...items, entity], result: entity };
      });
    },

    async update(id, data) {
      return mutateJson<T[], T | null>(file, (items) => {
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) return { next: items, result: null };
        const updated = { ...items[index], ...data, id, updatedAt: new Date().toISOString() } as T;
        const next = [...items];
        next[index] = updated;
        return { next, result: updated };
      });
    },

    async delete(id) {
      return mutateJson<T[], boolean>(file, (items) => {
        const next = items.filter((item) => item.id !== id);
        return { next, result: next.length !== items.length };
      });
    },

    async transaction<R>(fn: (items: T[]) => { items: T[]; result: R } | Promise<{ items: T[]; result: R }>) {
      return mutateJson<T[], R>(file, async (items) => {
        const { items: next, result } = await fn(items);
        return { next, result };
      });
    },
  };
}

/** Repository for single-object documents such as settings. */
export function createDocumentRepository<T extends object>(file: DataFile) {
  return {
    get: () => readJson<T>(file),
    async update(patch: Partial<T>) {
      return mutateJson<T, T>(file, (current) => {
        const next = { ...current, ...patch };
        return { next, result: next };
      });
    },
  };
}

export function newId() {
  return randomUUID().slice(0, 8);
}
