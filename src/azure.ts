import {
  AzureFunction,
  Context,
  HttpRequest as AzureHttpRequest,
} from "@azure/functions";

import { pipe } from "fp-ts/function";
import { ask, filterOrElse, map } from "fp-ts/ReaderTaskEither";
import { toEntries, fromEntries } from "fp-ts/Record";
import { toLowerCase } from "fp-ts/string";
import { mapFst } from "fp-ts/lib/Tuple";

import * as A from "fp-ts/Array";

import * as IO from "fp-ts/IO";

import { HttpRequest } from "./http";
import { Logger } from "./log";
import { Handler, RequestDecoder } from "./index";

const toHttpRequest = (req: AzureHttpRequest): HttpRequest => ({
  url: req.url,
  method: req.method || "GET",
  query: req.query,
  params: req.params,
  headers: pipe(
    toEntries(req.headers),
    A.map(mapFst(toLowerCase)),
    fromEntries
  ),
  type: "http",
  body: req.body,
});

class InvalidTriggerError extends Error {
  public readonly name = "InvalidTriggerError" as const;
  constructor(
    public readonly detail: string,
    public readonly title = "Invalid trigger"
  ) {
    super(`${title}: ${detail}`);
  }
}

export const fromHttpRequest: RequestDecoder<Context, HttpRequest> = pipe(
  ask<Context>(),
  filterOrElse(
    (ctx): ctx is Context & { req: AzureHttpRequest } =>
      "req" in ctx && ctx.req !== undefined,
    () =>
      new InvalidTriggerError(
        "this Azure Function must be triggered by an HTTP request"
      )
  ),
  map((ctx) => ctx.req),
  map(toHttpRequest)
);

export const useLogger: RequestDecoder<Context, Logger> = pipe(
  ask<Context>(),
  map((ctx) => ctx.log),
  map((logger) => ({
    log: (message: string) => IO.of(logger.info(message)),
  }))
);

export const unsafeRun =
  (handler: Handler<Context>): AzureFunction =>
  async (ctx: Context) => {
    const output = await handler(ctx)();
    if (output.type !== "http") {
      throw new Error("unsupported output type");
    }
    return {
      body: output.body,
      statusCode: output.statusCode,
      headers: output.headers,
    };
  };
