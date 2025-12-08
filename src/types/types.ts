export type constructorParams = {
    apiKey?: string;
    dedicatedUrl?: string;
    apiVersion?: string;
};
export type CHAIN_MAP = {
    chain_name: string;
    router_address: string;
    chain_id: number;
};

export type IntegrationData = {
    integratorAddress: string;
    integratorFeePercentageBps: number;
    integratorSurplusPercentageBps: number;
};