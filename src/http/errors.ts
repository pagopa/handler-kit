/* eslint-disable max-classes-per-file */

export class ForbiddenError extends Error {
  public readonly name = "ForbiddenError";
  constructor(
    public readonly detail: string,
    public readonly title = "You are not allowed here"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const notAuthorizedError = () =>
  new ForbiddenError(
    "You do not have enough permission to complete the operation you requested"
  );

export const notAuthorizedForProductionError = () =>
  new ForbiddenError(
    "You are not allowed to issue production calls at this time.",
    "Production call forbidden"
  );

export const notAuthorizedForRecipientError = () =>
  new ForbiddenError(
    "You are not allowed to issue requests for the recipient.",
    "Recipient forbidden"
  );

export const anonymousUserError = () =>
  new ForbiddenError(
    "The request could not be associated to a user, missing userId or subscriptionId.",
    "Anonymous user"
  );

export const noAuthorizationGroups = () =>
  new ForbiddenError(
    "You are not part of any valid scope, you should ask the administrator to give you the required permissions.",
    "User has no valid scopes"
  );

class ConflictError extends Error {
  public readonly name = "ConflictError";
  constructor(
    public readonly detail: string,
    public readonly title = "Conflict"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const conflictError = (detail: string) => new ConflictError(detail);

class ServiceTemporaryUnavailableError extends Error {
  public readonly name = "ServiceTemporaryUnavailableError";
  constructor(
    public readonly detail: string,
    public readonly title = "Service Temporary Unavailable"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const serviceUnavailableError = (detail: string) =>
  new ServiceTemporaryUnavailableError(detail);

export class BadRequestError extends Error {
  public readonly name = "BadRequestError";
  constructor(
    public readonly detail: string,
    public readonly title = "Bad request"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const badRequestError = (detail: string) => new BadRequestError(detail);

export class NotFoundError extends Error {
  public readonly name = "NotFoundError";
  constructor(
    public readonly detail: string,
    public readonly title = "Not Found"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const notFoundError = (detail: string) => new NotFoundError(detail);
class InternalServerError extends Error {
  public readonly name = "InternalServerError";
  constructor(
    public readonly detail: string,
    public readonly title = "Internal Server Error"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const toInternalServerError = (e: Error) =>
  new InternalServerError(e.message);

export type HttpError =
  | ForbiddenError
  | ConflictError
  | ServiceTemporaryUnavailableError
  | InternalServerError
  | BadRequestError
  | NotFoundError;
