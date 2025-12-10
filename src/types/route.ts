import { Token } from "./token";
import { ProtocolId } from "./enums";
import { BigNumberish } from "starknet";
import { IntegrationData } from "./types";

export type Percent = `${string}%`;

export type RouteOverrides = {
    reverse: boolean;
    direct: boolean;
    excludeProtocols: ProtocolId[];
};

export type RouteParams = {
    amount: AmountType;
    tokenInAddress: string;
    tokenOutAddress: string;
    integrationData?: IntegrationData;
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteExecuteParams = {
    amount: AmountType;
    tokenInAddress: string;
    tokenOutAddress: string;
    slippage: number;
    destination: string;
    integrationData?: IntegrationData;
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteParamsBatch = {
    amounts: AmountType[];
    tokenInAddresses: string[];
    tokenOutAddresses: string[];
    integrationData?: IntegrationData;
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteExecuteBatchParams = {
    amounts: AmountType[];
    tokenInAddresses: string[];
    tokenOutAddresses: string[];
    slippage: number;
    destination: string;
    integrationData?: IntegrationData;
} & Partial<
    Omit<RouteOverrides, "excludeProtocols"> & { excludeProtocols: string }
>;

export type RouteFailure = {
    success: false;
    errorMessage: string;
};
type meta = {
    apiVersion: string;
    timestamp: string;
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
    meta: meta;
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

export type EvmRouteParam = {
    token_in: string;
    token_out: string;
    amount_in: string;
    amount_out: string;
    min_received: string;
    destination: string;
    swap_type: number;
};

export type EvmSwapParam = {
    token_in: string;
    token_out: string;
    rate: number;
    protocol_id: number;
    pool_address: string;
    swap_type: number;
    extra_data: string | string[];
};

export type EvmTransactionData = {
    route: EvmRouteParam;
    swap_parameters: EvmSwapParam[];
    integrator_data?: string; // Integration data structure
};

export type StarknetCall = {
    contractAddress: string;
    entrypoint: string;
    calldata: string[];
};

export type StarknetRouteAndCalldata = {
    route: RouteSuccess;
    calldata: StarknetCall;
};

export type EvmRouteAndCalldata = {
    route: RouteSuccess;
    calldata: EvmTransactionData;
    integrator_data?: string; // Integration data structure
};

export type RouteAndCalldataResponse = StarknetRouteAndCalldata | EvmRouteAndCalldata;

export type BuildTransactionResponse = StarknetCall | EvmTransactionData;

export type AmountType = bigint | string | number | BigNumberish;
