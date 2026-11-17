import "server-only";
import type { ProviderId } from "../registry";
import type { Provider } from "../types";
import { binance } from "./binance";
import { gold } from "./gold";
import { mock } from "./mock";
import { nbe } from "./nbe";
import { oil } from "./oil";

const live: Record<ProviderId, Provider> = {
  binance,
  nbe,
  gold,
  oil,
};

export const providers: Record<ProviderId, Provider> =
  process.env.DATA_MODE === "mock"
    ? { binance: mock, nbe: mock, gold: mock, oil: mock }
    : live;
