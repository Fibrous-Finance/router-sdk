import { Router } from "../../src";
import { Wallet } from "ethers";
import {
    mockFetch,
    createMockResponse,
    createMockRoute,
    createMockEvmTransaction,
} from "../setup/test-setup";

describe("Router EVM-specific Methods", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
        mockFetch.mockClear();
    });

    describe("EVM Transaction Building", () => {
        it.each(["scroll", "base"])(
            "should build EVM transaction for %s",
            async (chain) => {
                const mockRoute = createMockRoute();
                const mockEvmData = createMockEvmTransaction();

                mockFetch
                    .mockResolvedValueOnce(createMockResponse(mockRoute))
                    .mockResolvedValueOnce(createMockResponse(mockEvmData));

                const result = await router.buildTransaction(
                    BigInt(1000),
                    "0x1",
                    "0x2",
                    1,
                    "0x3",
                    chain as "scroll" | "base",
                );

                if ("route" in result && "swap_parameters" in result) {
                    expect(result).toEqual(mockEvmData);
                } else {
                    fail("Expected EVM transaction data structure");
                }
            },
        );

        it("should build EVM transaction with different parameters", async () => {
            const mockRoute = createMockRoute();
            const mockEvmData = createMockEvmTransaction();

            mockFetch
                .mockResolvedValueOnce(createMockResponse(mockRoute))
                .mockResolvedValueOnce(createMockResponse(mockEvmData));

            await router.buildTransaction(
                BigInt(50000),
                "0xabc",
                "0xdef",
                3, // 3% slippage
                "0x123",
                "scroll",
            );

            expect(mockFetch).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("helper/calldata"),
                expect.objectContaining({
                    method: "POST",
                }),
            );
        });
    });

    describe("Contract Management", () => {
        it.each([
            [534352, "https://scroll-rpc.com"],
            [8453, "https://base-rpc.com"],
            [143, "https://monad-rpc.com"],
        ])(
            "should create contract instance for chainId %i",
            async (chainId, rpcUrl) => {
                const contract = await router.getContractInstance(
                    rpcUrl,
                    chainId as number,
                );
                expect(contract).toBeDefined();
            },
        );

        it.each([534352, 8453, 143])(
            "should create contract with wallet for chainId %i",
            async (chainId) => {
                const mockWallet = new Wallet(
                    "0x1234567890123456789012345678901234567890123456789012345678901234",
                );
                const contract = await router.getContractWAccount(
                    mockWallet,
                    chainId as number,
                );
                expect(contract).toBeDefined();
            },
        );

        it("should use correct router addresses", () => {
            const scrollChain = router.supportedChains.find(
                (c) => c.chain_name === "scroll",
            );
            const baseChain = router.supportedChains.find(
                (c) => c.chain_name === "base",
            );
            expect(scrollChain?.router_address).toBe(
                "0x4bb92d3f730d5a7976707570228f5cb7e09094c5",
            );
            expect(baseChain?.router_address).toBe(
                "0x274602a953847d807231d2370072F5f4E4594B44",
            );
        });
    });

    describe("Error Handling", () => {
        it("should throw error for invalid chain", async () => {
            await expect(
                router.getContractInstance("https://rpc.com", 999999),
            ).rejects.toThrow("Chain not supported");
        });

        it("should handle network errors gracefully", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(
                router.buildTransaction(
                    BigInt(1000),
                    "0x1",
                    "0x2",
                    1,
                    "0x3",
                    "scroll",
                ),
            ).rejects.toThrow("Network error");
        });
    });
});
