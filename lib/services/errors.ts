/** Typed error thrown by the service layer and mapped to HTTP responses by route handlers. */
export class ServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const notFound = (entity: string) => new ServiceError(404, "NOT_FOUND", `${entity} not found`);
export const conflict = (message: string, code = "CONFLICT") => new ServiceError(409, code, message);
export const badRequest = (message: string, code = "BAD_REQUEST") => new ServiceError(400, code, message);
export const unauthorized = () => new ServiceError(401, "UNAUTHORIZED", "Please sign in to continue");
