# handler-kit

A simple functional toolkit for creating handlers that are agnostic to the framework and transport protocols utilized

Inspired by [Go Kit](https://gokit.io) and based on [fp-ts](https://github.com/gcanti/fp-ts)

⚠️ This library is still in beta, and the API may change at any time without affecting compatibility. ⚠️

## How to install

Using npm

```sh
npm i @pagopa/handler-kit
```

Or, if you use yarn

```sh
yarn add @pagopa/handler-kit
```

## How to use (WIP)

In this example, we develop an Azure Functions handler that reads the name provided in the query params as input.

```typescript
import { createHandler } from "@pagopa/handler-kit";
import {
  HttpRequest,
  query,
  jsonResponse,
  withStatus
} from "@pagopa/handler-kit/lib/http";
import * as azure from "@pagopa/handler-kit/lib/azure";

import { pipe, flow } from "fp-ts/function";
import * as R from "fp-ts/Reader";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";

import { AzureFunction } from "@azure/functions";

// (1) create you custom and agnostic decoder
const getNameFromQueryOrDefault = (default: string) => pipe(
  R.ask<HttpRequest>(),
  R.map(flow(
    query("name"),
    O.getOrElse(() => default)
  )),
)

// (2) combine with platform specific decoder
const requestDecoder = pipe(
  azure.fromHttpRequest,
  RTE.map(getNameFromQueryOrDefault("world"))
)

export const run: AzureFunction = pipe(
  createHandler(
    // (3) use the decoder
    requestDecoder,
    // (4) consume the value decoded
    (name) => TE.right({
      message: `Hello, ${name}!`
    }),
    // (5) encode the response on error
    flow(jsonResponse, withStatus(500)),
    // (6) encode the response on success
    jsonResponse,
  ),
  // (7) run all effects!!
  azure.unsafeRun,
);
```
