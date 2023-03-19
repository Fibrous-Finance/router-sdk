import { Token } from './token';
import { Protocol } from './enums';

export type Percent = `${string}%`;

export interface RouteConfig {
    /**
     */
    amount: number
  
    /**
     */
    tokenInAddress: string
  
    /**
     */
    tokenOutAddress: string
  
    /**
     */
    reverse?: boolean
  
    /**
     */
    direct: boolean
  }


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
      route: FormattedRoute[];
      time: number;
  };
  export declare type RouterResponse = {
    success: true;
    inputToken: Token;
    inputAmount: string;
    outputToken: Token;
    outputAmount: string;
    estimatedGasUsed: string;
    route: Route[];
    time: number;
  };
  export type FormattedRoute = {
    percent: Percent;
    swaps: FormattedSwap[][];
};

export type FormattedSwap = {
    protocol: Protocol;
    poolId: string;
    poolAddress: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    percent: Percent;
};

export type RouterError = {
  statusCode: number;
  error: string;
}
export declare type Swap = {
  protocol: Protocol;
  poolId: string;
  poolAddress: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  percent: Percent;
};
export declare type Route = {
  percent: Percent;
  swaps: Swap[][];
};

/** [token_in, token_out, rate, protocol, pool_address] */
export type CairoSwap = [string, string, string, string, string];

export const trimPercent = (p: Percent): number => Number(p.replace("%", ""));
export const parsePercent = (p: number): string =>
  String(Math.floor(Number(p.toFixed(4)) * 1_000_000));

export interface Transaction {
  contractAddress: string;
  entryPoint: string;
  call_data: CairoSwap[]
}

export interface TransactionConfig {
  route: RouterResponse;
  slippage: number;
  accountAddress: string;
  routerAddress: string;
}