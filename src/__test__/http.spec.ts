import { isNone, getOrElse } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import {
  HttpRequest,
  jsonResponse,
  response,
  withStatus,
  query,
  header,
  request,
} from "../http";

describe("http request", () => {
  describe("get parameters", () => {
    let req: HttpRequest;
    beforeEach(() => {
      req = request("https://localhost/test", "get");
    });
    it('should return "none" when the required param is not found', () => {
      const result = pipe(req, query("notdefined"));
      expect(isNone(result)).toBe(true);
    });
    it("shoud return the param wrapped with an optional when it is found", () => {
      const reqWithHeader = {
        ...req,
        headers: { "content-type": "application/xml" },
      };
      const result = pipe(reqWithHeader, header("Content-Type"));
      expect(
        pipe(
          result,
          getOrElse(() => "not defined")
        )
      ).toBe("application/xml");
    });
    test("all param names should be treated as case insensitive", () => {
      const reqWithHeader = {
        ...req,
        headers: { "x-subscription-id": "my-subscription" },
      };
      ["x-subscription-id", "X-Subscription-Id", "X-SUBSCRIPTION-ID"].forEach(
        (name) => {
          expect(pipe(reqWithHeader, header(name), isNone)).toBe(false);
        }
      );
    });
  });
});

describe("http response", () => {
  it("should have 200 as default status code", () => {
    const res = pipe("Test default response", response);
    expect(res.statusCode).toBe(200);
  });
  describe("withStatus", () => {
    it("should return a new response with the updated status", () => {
      const res = pipe("Test response with status", response, withStatus(400));
      expect(res).toStrictEqual({ ...res, statusCode: 400 });
    });
  });
  describe("jsonResponse", () => {
    it('should set the "Content-Type" header to "application/json"', () => {
      const res = pipe({ message: "Test json response" }, jsonResponse);
      expect(res.headers["content-type"]).toBe("application/json");
    });
    it("should set as body the json serialized data", () => {
      const data = { message: "Test response to be serialized" };
      const res = jsonResponse(data);
      expect(res.body).toBe(JSON.stringify(data));
    });
  });
});
