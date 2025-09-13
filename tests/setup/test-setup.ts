import {
    ProtocolId,
    Token,
    EvmTransactionData,
    RouteSuccess,
} from "../../src/types";

// Modern Jest fetch mocking with type safety
export const mockFetch = jest.fn() satisfies jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Type-safe helper to create mock fetch responses
export const createMockResponse = <T>(data: T): Partial<Response> => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
});

// Mock ethers components
jest.mock("ethers", () => ({
    ...jest.requireActual("ethers"),
    Wallet: jest.fn().mockImplementation(() => ({
        getAddress: jest.fn().mockResolvedValue("0x123"),
        provider: {
            call: jest.fn(),
        },
    })),
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
        call: jest.fn(),
    })),
    Contract: jest.fn().mockImplementation(() => ({
        allowance: jest.fn().mockResolvedValue(BigInt(0)),
        approve: jest.fn().mockResolvedValue({
            wait: jest.fn().mockResolvedValue({}),
        }),
    })),
}));

// Real API format test data matching production responses
export const createMockTokensMap = (): Map<string, Token> => {
    const tokenMap = new Map<string, Token>();

    // Starknet tokens (real format)
    tokenMap.set("eth", {
        address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        symbol: "ETH",
        decimals: "18",
        price: "3500.50",
        image_url:
            "https://raw.githubusercontent.com/Fibrous-Finance/Fibrous-tokens/main/images/starknet/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7.svg",
        base: null,
        native: null,
        verified: true,
        category: "",
    });

    tokenMap.set("usdc", {
        address:
            "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        name: "USD Coin",
        symbol: "USDC",
        decimals: "6",
        price: "1.00",
        image_url:
            "https://raw.githubusercontent.com/Fibrous-Finance/Fibrous-tokens/main/images/starknet/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8.svg",
        base: null,
        native: null,
        verified: true,
        category: "",
    });

    tokenMap.set("usdt", {
        address:
            "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
        name: "Tether USD",
        symbol: "USDT",
        decimals: "6",
        price: "1.00",
        image_url:
            "https://raw.githubusercontent.com/Fibrous-Finance/Fibrous-tokens/main/images/starknet/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8.svg",
        base: null,
        native: null,
        verified: true,
        category: "",
    });

    return tokenMap;
};

// Base chain tokens (real format)
export const createMockBaseTokensMap = (): Map<string, Token> => {
    const tokenMap = new Map<string, Token>();

    tokenMap.set("eth", {
        address: "0x0000000000000000000000000000000000000000",
        name: "Ethereum",
        symbol: "ETH",
        decimals: "18",
        price: "3500.50",
        image_url: "https://ethereum-optimism.github.io/data/ETH/logo.svg",
        verified: true,
        category: null,
    });

    tokenMap.set("usdc", {
        address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        name: "USD Coin",
        symbol: "USDC",
        decimals: "6",
        price: "1.00",
        image_url: "https://ethereum-optimism.github.io/data/USDC/logo.svg",
        verified: true,
        category: null,
    });

    return tokenMap;
};

// Legacy format for backward compatibility
export const mockTokens: Token[] = [
    {
        address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        name: "Ether",
        symbol: "ETH",
        decimals: "18",
        price: "3500.50",
        image_url:
            "https://raw.githubusercontent.com/Fibrous-Finance/Fibrous-tokens/main/images/starknet/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7.svg",
        base: null,
        native: null,
        verified: true,
        category: "",
    },
    {
        address:
            "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        name: "USD Coin",
        symbol: "USDC",
        decimals: "6",
        price: "1.00",
        image_url:
            "https://raw.githubusercontent.com/Fibrous-Finance/Fibrous-tokens/main/images/starknet/0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8.svg",
        base: null,
        native: null,
        verified: true,
        category: "",
    },
];

// Real protocols format matching production API
export const createMockProtocols = () => ({
    EkuboLimitOrder: 12 as ProtocolId,
    "10kSwap": 3 as ProtocolId,
    SithSwapV2: 4 as ProtocolId,
    SithSwapStable: 4 as ProtocolId,
    Haiko: 5 as ProtocolId,
    Jediswap: 1 as ProtocolId,
    Ekubo: 2 as ProtocolId,
    Starkswap: 7 as ProtocolId,
});

// Legacy format for backward compatibility
export const mockProtocols = [
    { amm_name: "EkuboLimitOrder", protocol: 12 as ProtocolId },
    { amm_name: "10kSwap", protocol: 3 as ProtocolId },
    { amm_name: "SithSwapV2", protocol: 4 as ProtocolId },
    { amm_name: "Jediswap", protocol: 1 as ProtocolId },
];

export const createMockRoute = (
    overrides?: Partial<RouteSuccess>,
): RouteSuccess => ({
    success: true,
    inputToken: mockTokens[0],
    outputToken: mockTokens[1],
    inputAmount: "1000000000000000000",
    outputAmount: "3000000000",
    estimatedGasUsed: "200000",
    estimatedGasUsedInUsd: "10.5",
    route: [],
    time: 150,
    ...overrides,
});

export const createMockEvmTransaction = (): EvmTransactionData => ({
    route: {
        token_in: "0x1",
        token_out: "0x2",
        amount_in: "1000",
        amount_out: "2000",
        min_received: "1980",
        destination: "0x3",
        swap_type: 1,
    },
    swap_parameters: [],
});

export const supportedChains = ["starknet", "scroll", "base"] as const;

// Modern Jest helpers with Context7 best practices
export const createMockError = (
    message: string,
    status: number = 400,
): Error => {
    const error = new Error(message);
    (error as any).status = status;
    return error;
};

// Type-safe mock factory for chain-specific data
export const createChainMockData = <T>(data: Record<string, T>) => {
    return jest.fn().mockImplementation((chain: string) => {
        const chainData = data[chain];
        if (!chainData) {
            throw createMockError(`Unsupported chain: ${chain}`, 400);
        }
        return chainData;
    });
};

// Async mock factory with proper error handling
export const createAsyncMock = <T>(
    value?: T,
    shouldReject = false,
): jest.MockedFunction<() => Promise<T>> => {
    if (shouldReject) {
        return jest
            .fn()
            .mockRejectedValue(value || createMockError("Mock rejection"));
    }
    return jest.fn().mockResolvedValue(value as T);
};

// Mock reset helper for clean test isolation
export const resetAllMocks = () => {
    mockFetch.mockReset();
    jest.clearAllMocks();
};

// Extend Jest matchers for token validation
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R> {
            toHaveValidTokenFormat(): R;
            toHaveValidProtocolFormat(): R;
        }
    }
}

// Custom matcher for token format validation
expect.extend({
    toHaveValidTokenFormat(received) {
        const isValid =
            typeof received === "object" &&
            received !== null &&
            typeof received.address === "string" &&
            typeof received.name === "string" &&
            typeof received.symbol === "string" &&
            typeof received.decimals === "string" &&
            (received.price === null || typeof received.price === "string");

        return {
            message: () =>
                `Expected ${received} to have valid token format with address, name, symbol, decimals (string), and price (string|null)`,
            pass: isValid,
        };
    },

    toHaveValidProtocolFormat(received) {
        const isValid =
            typeof received === "object" &&
            received !== null &&
            Object.values(received).every((value) => typeof value === "number");

        return {
            message: () =>
                `Expected ${received} to have valid protocol format with protocol IDs as numbers`,
            pass: isValid,
        };
    },
});
