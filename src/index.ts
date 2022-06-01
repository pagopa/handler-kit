import {
  ReaderTaskEither,
  chainTaskEitherK,
  fold,
  right,
} from "fp-ts/ReaderTaskEither";

import { TaskEither } from "fp-ts/TaskEither";

import { ReaderTask, of as toReaderTask } from "fp-ts/ReaderTask";
import { pipe, flow } from "fp-ts/function";
import { HttpResponse } from "./http";

export type RequestDecoder<R, D> = ReaderTaskEither<R, Error, D>;

export type Service<P, A> = (payload: P) => TaskEither<Error, A>;

export type Output = HttpResponse;

export type Handler<R> = ReaderTask<R, Output>;

export const createHandler = <R, P, A>(
  requestDecoder: RequestDecoder<R, P>,
  service: Service<P, A>,
  onError: (e: Error) => Output,
  onSuccess: (a: A) => Output
): Handler<R> =>
  pipe(
    requestDecoder,
    chainTaskEitherK(service),
    fold<R, Error, A, Output>(
      flow(onError, toReaderTask),
      flow(onSuccess, toReaderTask)
    )
  );

export const nopRequestDecoder = right(void 0);
