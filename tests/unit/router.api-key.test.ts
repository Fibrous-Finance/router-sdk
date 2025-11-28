import { Router } from "../../src/router/router";
import {
    createMockResponse,
    mockFetch,
    createTestRouter,
} from "../setup/test-setup";

describe("Router API Key Handling", () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it("should include API key in headers when provided", async () => {
        const router = createTestRouter();
        (router as any).apiKey = "test-api-key";
        mockFetch.mockResolvedValueOnce(createMockResponse([]));

        await router.supportedTokens(23448594291968336);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/starknet/tokens"),
            { headers: { "X-API-Key": "test-api-key" } },
        );
    });

    it("should not include API key in headers when not provided", async () => {
        const router = createTestRouter();
        mockFetch.mockResolvedValueOnce(createMockResponse([]));

        await router.supportedTokens(23448594291968336);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/starknet/tokens"),
            { headers: {} },
        );
    });

    it("should include API key in all request types", async () => {
        const router = createTestRouter();
        (router as any).apiKey = "my-secret-key";
        mockFetch.mockResolvedValue(createMockResponse([]));

        await router.supportedTokens(8453);
        await router.supportedProtocols(8453);
        await router.getToken("0x1", 23448594291968336);

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
