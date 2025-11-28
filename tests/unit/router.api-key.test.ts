import { Router } from "../../src";
import { mockFetch, createMockResponse } from "../setup/test-setup";

describe("Router API Key Handling", () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it("should include API key in headers when provided", async () => {
        const routerWithKey = new Router(undefined, "test-api-key");
        mockFetch.mockResolvedValueOnce(createMockResponse([]));

        await routerWithKey.supportedTokens(23448594291968336);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/starknet/tokens"),
            { headers: { "X-API-Key": "test-api-key" } },
        );
    });

    it("should not include API key in headers when not provided", async () => {
        const router = new Router();
        mockFetch.mockResolvedValueOnce(createMockResponse([]));

        await router.supportedTokens(23448594291968336);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/starknet/tokens"),
            { headers: {} },
        );
    });

    it("should include API key in all request types", async () => {
        const routerWithKey = new Router(undefined, "my-secret-key");
        mockFetch.mockResolvedValue(createMockResponse([]));

        await routerWithKey.supportedTokens(8453);
        await routerWithKey.supportedProtocols(8453);
        await routerWithKey.getToken("0x1", 23448594291968336);

        expect(mockFetch).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("/base/tokens"),
            { headers: { "X-API-Key": "my-secret-key" } },
        );
        expect(mockFetch).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("/base/protocols"),
            { headers: { "X-API-Key": "my-secret-key" } },
        );
        expect(mockFetch).toHaveBeenNthCalledWith(
            3,
            expect.stringContaining("/starknet/tokens/0x1"),
            { headers: { "X-API-Key": "my-secret-key" } },
        );
    });
});
