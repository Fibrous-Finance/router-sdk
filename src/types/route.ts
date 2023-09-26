import { Token } from "./token";
import { ProtocolId } from "./enums";
import { BigNumber } from "@ethersproject/bignumber";

export type Percent = `${string}%`;

export type RouteOverrides = {
    reverse: boolean;
    direct: boolean;
    excludeProtocols: ProtocolId[];
};

export type RouteParams = {
    amount: BigNumber;
    tokenInAddress: string;
    tokenOutAddress: string;
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteExecuteParams = {
    amount: string;
    tokenInAddress: string;
    tokenOutAddress: string;
    slippage: number;
    destination: string;
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteFailure = {
    success: false;
    errorMessage: string;
};

export type RouteSuccess = {
    success: true;
    inputToken: Token;
    inputAmount: string;
    outputToken: Token;
    outputAmount: string;
    estimatedGasUsed: string;
    route: Route[];
    time: number;
};

export type RouteResponse = RouteFailure | RouteSuccess;

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
    call_data: string[];
};

export type TransactionConfig = {
    route: RouteSuccess;
    slippage: number;
    accountAddress: string;
};
