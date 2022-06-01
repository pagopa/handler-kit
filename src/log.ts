import { IO } from "fp-ts/IO";

export type Logger = {
  log: (message: string) => IO<void>;
};
