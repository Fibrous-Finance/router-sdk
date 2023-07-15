import { Token } from "./token";
import { ProtocolId } from "./enums";

export type Percent = `${string}%`;

export type RouteConfig = {
    amount: number;
    tokenInAddress: string;
    tokenOutAddress: string;
    reverse?: boolean;
    direct: boolean;
};

export type RouteResponse =
    | {
          success: false;
          errorMessage: string;
      }
    | {
          success: true;
          inputToken: Token;
          inputAmount: string;
          outputToken: Token;
          outputAmount: string;
          estimatedGasUsed: string;
          route: Route[];
          time: number;
      };

export type RouterResponse = {
    success: true;
    inputToken: Token;
    inputAmount: string;
    outputToken: Token;
    outputAmount: string;
    estimatedGasUsed: string;
    route: Route[];
    time: number;
};

export type RouterError = {
    statusCode: number;
    error: string;
};

export type Route = {
    percent: Percent;
    swaps: Swap[][];
};

export type Swap = {
    protocol: ProtocolId;
    poolId: string;
    poolAddress: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    percent: Percent;
};

/** [token_in, token_out, rate, protocol, pool_address] */
export type CairoSwap = [string, string, string, string, string];

export type Transaction = {
    contractAddress: string;
    entryPoint: string;
    call_data: CairoSwap[];
};

export type TransactionConfig = {
    route: RouterResponse;
    slippage: number;
    accountAddress: string;
    routerAddress: string;
};
