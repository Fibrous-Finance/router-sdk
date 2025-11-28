import { Router } from "../../src";
import {
    mockFetch,
    createMockResponse,
    mockChainDefinitions,
} from "../setup/test-setup";

describe("Supported Chains Logic", () => {
    let router: Router;

    beforeEach(() => {
        mockFetch.mockClear();
        router = new Router();
    });

    it("should start with empty supported chains", () => {
        expect(router.supportedChains).toEqual([]);
    });

    it("should fetch and populate supported chains correctly", async () => {
        mockFetch.mockResolvedValueOnce(
            createMockResponse(mockChainDefinitions),
        );

        const chains = await router.refreshSupportedChains();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
            "https://graph.fibrous.finance/supported-chains",
            expect.any(Object),
        );
        expect(chains).toHaveLength(mockChainDefinitions.length);
        expect(router.supportedChains).toEqual(mockChainDefinitions);
    });

    it("should handle race conditions by making only one API call", async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockChainDefinitions));

        // Call refreshSupportedChains multiple times concurrently
        const promises = [
            router.refreshSupportedChains(),
            router.refreshSupportedChains(),
            router.refreshSupportedChains(),
        ];

        await Promise.all(promises);

        // Should only be called once despite multiple concurrent calls
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should retrieve all supported chains by ID and Name correctly", async () => {
        mockFetch.mockResolvedValueOnce(
            createMockResponse(mockChainDefinitions),
        );
        await router.refreshSupportedChains();

        mockChainDefinitions.forEach((expectedChain) => {
            // Test by ID
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chainById = (router as any).getChain(expectedChain.chain_id);
            expect(chainById).toBeDefined();
            expect(chainById).toEqual(expectedChain);

            // Test by Name
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chainByName = (router as any).getChain(
                expectedChain.chain_name,
            );
            expect(chainByName).toBeDefined();
            expect(chainByName).toEqual(expectedChain);
        });
    });

    it("should throw error for unsupported chain ID", async () => {
        mockFetch.mockResolvedValueOnce(
            createMockResponse(mockChainDefinitions),
        );
        await router.refreshSupportedChains();

        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (router as any).getChain(12345);
        }).toThrow("Chain not supported: 12345");
    });

    it("should throw error for unsupported chain Name", async () => {
        mockFetch.mockResolvedValueOnce(
            createMockResponse(mockChainDefinitions),
        );
        await router.refreshSupportedChains();

        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (router as any).getChain("invalid-chain");
        }).toThrow("Chain not supported: invalid-chain");
    });

    it("should throw error when API fails", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
        });

        await expect(router.refreshSupportedChains()).rejects.toThrow(
            "Failed to fetch supported chains: 500 Internal Server Error",
        );
    });
});
