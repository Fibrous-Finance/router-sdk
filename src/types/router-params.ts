import { AmountType, IntegrationData, RouteOverrides } from ".";

export type getBestRouteParams = {
    amount: AmountType;
    tokenInAddress: string;
    tokenOutAddress: string;
    chainId?: number;
    chainName?: string;
    integrationData?: IntegrationData;
    options?: Partial<RouteOverrides>;
};

export type getBestRouteBatchParams = {
    amounts: AmountType[];
    tokenInAddresses: string[];
    tokenOutAddresses: string[];
    chainId?: number;
    chainName?: string;
    integrationData?: IntegrationData;
    options?: Partial<RouteOverrides>;
};


export type buildTransactionParams = {
    inputAmount: AmountType;
    tokenInAddress: string;
    tokenOutAddress: string;
    slippage: number;
    destination: string;
    chainId?: number;
    chainName?: string;
    integrationData?: IntegrationData;
    options?: Partial<RouteOverrides>;
};


export type buildRouteAndCalldataParams = {
    inputAmount: AmountType;
    tokenInAddress: string;
    tokenOutAddress: string;
    slippage: number;
    destination: string;
    chainId?: number;
    chainName?: string;
    integrationData?: IntegrationData;
    options?: Partial<RouteOverrides>;
};


export type buildBatchTransactionParams = {
    inputAmounts: AmountType[];
    tokenInAddresses: string[];
    tokenOutAddresses: string[];
    slippage: number;
    destination: string;
    chainId?: number;
    chainName?: string;
    integrationData?: IntegrationData;
    options?: Partial<RouteOverrides>;
};