import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Low-level JSON file store. Server-only.
 *
 * - Files live in `<project>/data/*.json` (override with DATA_DIR).
 * - Writes are atomic (write temp file, then rename) so a crash mid-write
 *   never leaves a half-written JSON file.
 * - Writes to the same file are serialised through an in-process queue so two
 *   concurrent requests cannot interleave read-modify-write cycles.
 *
 * This is intentionally the ONLY module that touches the filesystem for data.
 */

export const DATA_FILES = [
  "clinic",
  "settings",
  "dentists",
  "services",
  "appointments",
  "patients",
  "treatments",
  "prescriptions",
  "invoices",
  "payments",
  "portfolio",
  "gallery",
  "testimonials",
  "faqs",
  "leads",
  "notifications",
] as const;
export type DataFile = (typeof DATA_FILES)[number];

export class JsonStoreError extends Error {
  constructor(
    message: string,
    public readonly file: DataFile,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "JsonStoreError";
  }
}

const dataDir = () => process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const filePath = (file: DataFile) => path.join(dataDir(), `${file}.json`);

// Per-file promise chains used as a simple mutex.
const locks = new Map<DataFile, Promise<unknown>>();

async function withLock<T>(file: DataFile, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(file) ?? Promise.resolve();
  const next = previous.then(task, task);
  locks.set(
    file,
    next.catch(() => undefined),
  );
  return next;
}

export async function readJson<T>(file: DataFile): Promise<T> {
  try {
    const raw = await fs.readFile(filePath(file), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new JsonStoreError(`Unable to read data store "${file}"`, file, error);
  }
}

export async function writeJson<T>(file: DataFile, data: T): Promise<void> {
  const target = filePath(file);
  const tmp = `${target}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
    await fs.rename(tmp, target);
  } catch (error) {
    await fs.rm(tmp, { force: true }).catch(() => undefined);
    throw new JsonStoreError(`Unable to write data store "${file}"`, file, error);
  }
}

/** Read, transform and write a file while holding its lock. */
export async function mutateJson<T, R>(file: DataFile, mutate: (current: T) => { next: T; result: R } | Promise<{ next: T; result: R }>) {
  return withLock(file, async () => {
    const current = await readJson<T>(file);
    const { next, result } = await mutate(current);
    await writeJson(file, next);
    return result;
  });
}
