import { Router } from "../../src";
import {
    mockFetch,
    createMockResponse,
    mockTokens,
    mockProtocols,
    createMockRoute,
} from "../setup/test-setup";

describe("Router Multi-Chain Support", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
        mockFetch.mockClear();
    });

    it("should fetch supported tokens for any chain", async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse(mockTokens));

        const tokens = await router.supportedTokens(23448594291968336);

        expect(mockFetch).toHaveBeenCalledWith(
            `${router.GRAPH_API_URL}/starknet/tokens`,
            { headers: {} },
        );
        expect(tokens.get("eth")).toEqual(mockTokens[0]);
        expect(tokens.get("usdc")).toEqual(mockTokens[1]);
    });

    it("should fetch supported protocols for any chain", async () => {
        mockFetch.mockResolvedValueOnce(createMockResponse(mockProtocols));

        const protocols = await router.supportedProtocols(8453);

        expect(mockFetch).toHaveBeenCalledWith(
            `${router.GRAPH_API_URL}/base/protocols`,
            { headers: {} },
        );
        expect(protocols).toEqual({
            "10kSwap": 3,
            EkuboLimitOrder: 12,
            Jediswap: 1,
            SithSwapV2: 4,
        });
    });

    it("should get best route for any chain", async () => {
        const mockRoute = createMockRoute();
        mockFetch.mockResolvedValueOnce(createMockResponse(mockRoute));

        const result = await router.getBestRoute(
            BigInt("1000000000000000000"),
            "0x1",
            "0x2",
            undefined,
            undefined,
            534352,
        );

        expect(mockFetch).toHaveBeenCalledWith(
            `${router.DEFAULT_API_URL}/scroll/route?amount=1000000000000000000&tokenInAddress=0x1&tokenOutAddress=0x2`,
            { headers: {} },
        );
        expect(result).toEqual(mockRoute);
    });

    it("should get individual token by address", async () => {
        const mockToken = mockTokens[0];
        mockFetch.mockResolvedValueOnce(createMockResponse(mockToken));

        const token = await router.getToken("0x1", 23448594291968336);

        expect(mockFetch).toHaveBeenCalledWith(
            `${router.GRAPH_API_URL}/starknet/tokens/0x1`,
            { headers: {} },
        );
        expect(token).toEqual(mockToken);
    });

    it("should handle duplicate token symbols correctly", async () => {
        const duplicateTokens = [
            ...mockTokens,
            {
                name: "Wrapped Ethereum",
                symbol: "ETH",
                decimals: 18,
                address: "0x3",
                isBase: false,
                isNative: false,
                price: 3000,
            },
        ];

        mockFetch.mockResolvedValueOnce(createMockResponse(duplicateTokens));

        const tokens = await router.supportedTokens(23448594291968336);

        expect(tokens.get("eth")).toEqual(mockTokens[0]);
        expect(tokens.size).toBe(2);
    });
});
