import { Token } from "./token";
import { ProtocolId } from "./enums";

export type Percent = `${string}%`;

export type RouteOverrides = {
    reverse: boolean;
    direct: boolean;
    excludeProtocols: ProtocolId[];
};

export type RouteParams = {
    amount: bigint;
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

export type RouteParamsBatch = {
    amounts: bigint[];
    tokenInAddresses: string[];
    tokenOutAddresses: string[];
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteExecuteBatchParams = {
    amounts: string[];
    tokenInAddresses: string[];
    tokenOutAddresses: string[];
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
    estimatedGasUsedInUsd: string;
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
    poolName: string;
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

export interface EvmRouteParam {
    token_in: string;
    token_out: string;
    amount_in: string;
    amount_out: string;
    min_received: string;
    destination: string;
    swap_type: number;
}

export interface EvmSwapParam {
    token_in: string;
    token_out: string;
    rate: number;
    protocol_id: number;
    pool_address: string;
    swap_type: number;
    extra_data: string | string[];
}

export interface EvmTransactionData {
    route: EvmRouteParam;
    swap_parameters: EvmSwapParam[];
}
