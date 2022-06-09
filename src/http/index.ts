import { pipe } from "fp-ts/function";
import { lookup, upsertAt } from "fp-ts/Record";
import * as t from "io-ts";
import { HttpError, toInternalServerError } from "./errors";

export type HttpRequest = {
  type: "http";
  url: string;
  method: string;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
};

export const request = (url: string, method: string): HttpRequest => ({
  type: "http",
  url,
  method,
  params: {},
  query: {},
  headers: {},
  body: void 0,
});

const param =
  (type: keyof Pick<HttpRequest, "query" | "headers" | "params">) =>
  (name: string) =>
  (req: HttpRequest) =>
    lookup(name.toLowerCase())(req[type]);

export const query = param("query");
export const header = param("headers");
export const path = param("params");

export const requireBody = (codec: t.Mixed) => (req: HttpRequest) =>
  codec.decode(req.body);

export type HttpStatusCode = number;

export type HttpResponse = {
  type: "http";
  body: string;
  statusCode: HttpStatusCode;
  headers: Record<string, string>;
};

export const response = (body: string): HttpResponse => ({
  type: "http",
  body,
  statusCode: 200,
  headers: {},
});

export const withStatus =
  (statusCode: number) =>
  (res: HttpResponse): HttpResponse => ({
    ...res,
    statusCode,
  });

export const withHeader =
  (name: string, value: string) => (res: HttpResponse) => ({
    ...res,
    headers: pipe(res.headers, upsertAt(name.toLowerCase(), value)),
  });

export const jsonResponse = <A>(a: A) =>
  pipe(
    JSON.stringify(a),
    response,
    withHeader("Content-Type", "application/json")
  );

export const errorResponse = (e: Error) => {
  const { title, detail, name } = isHttpError(e) ? e : toInternalServerError(e);
  const statusCodes: Record<HttpError["name"], HttpStatusCode> = {
    InternalServerError: 500,
    ConflictError: 409,
    ForbiddenError: 403,
    ServiceTemporaryUnavailableError: 503,
    BadRequestError: 400,
    NotFoundError: 404,
  };
  const status = statusCodes[name];
  return pipe(
    {
      title,
      detail,
      status,
    },
    jsonResponse,
    withStatus(status)
  );
};

const isHttpError = (e: Error): e is HttpError =>
  [
    "ForbiddenError",
    "ConflictError",
    "ServiceTemporaryUnabailableError",
    "InternalServerError",
    "BadRequestError",
  ].includes(e.name);
