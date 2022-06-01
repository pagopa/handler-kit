import { Context, Form } from "@azure/functions";

import { mock, MockProxy } from "jest-mock-extended";

import { keys } from "fp-ts/Record";
import { filter, size } from "fp-ts/Array";

import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import { pipe } from "fp-ts/function";
import { fromHttpRequest } from "../azure";

describe("fromHttpRequest", () => {
  describe("Given an Azure Function Context", () => {
    let ctx: MockProxy<Context>;
    beforeAll(() => {
      ctx = mock<Context>();
    });
    describe("When the Azure Function is not triggered by HTTP", () => {
      beforeAll(() => {
        ctx.req = undefined;
      });
      test(`Then "fromHttpRequest" should return an error`, async () => {
        const httpRequestFromGivenContext = pipe(
          fromHttpRequest(ctx),
          TE.getOrElseW(T.of)
        );
        const requestOrError = await httpRequestFromGivenContext();
        expect(requestOrError).toBeInstanceOf(Error);
      });
    });
    describe("When the Azure Functions is triggered by HTTP", () => {
      beforeAll(() => {
        ctx.req = {
          url: "https://localhost:3000/test-func",
          method: "GET",
          query: {
            name: "test-func",
          },
          params: {},
          headers: {
            "X-Product-Id": "my-product-id",
            "x-subscription-id": "my-subscription-id",
          },
          user: null,
          parseFormBody: () => mock<Form>(),
        };
      });
      test(`Then "fromHttpRequest" should return a parsed "HttpRequest"`, async () => {
        const httpRequestFromGivenContext = pipe(
          fromHttpRequest(ctx),
          TE.getOrElseW(T.of)
        );
        const requestOrError = await httpRequestFromGivenContext();
        expect(requestOrError).toStrictEqual({
          type: "http",
          url: "https://localhost:3000/test-func",
          method: "GET",
          query: {
            name: "test-func",
          },
          params: {},
          headers: {
            "x-product-id": "my-product-id",
            "x-subscription-id": "my-subscription-id",
          },
          body: undefined,
        });
      });
      test(`Then the parsed "HttpRequest" should have all header names in lowercase`, async () => {
        const httpRequestFromGivenContext = pipe(
          fromHttpRequest(ctx),
          TE.getOrElseW(T.of)
        );
        const requestOrError = await httpRequestFromGivenContext();
        expect(requestOrError).not.toBeInstanceOf(Error);
        if (!(requestOrError instanceof Error)) {
          const headers = keys(requestOrError.headers);
          const lowerHeaders = pipe(
            headers,
            filter((name) => name === name.toLowerCase())
          );
          expect(size(lowerHeaders)).toBe(size(headers));
        }
      });
    });
  });
});
