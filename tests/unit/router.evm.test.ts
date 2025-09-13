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
            ["scroll", "https://scroll-rpc.com"],
            ["base", "https://base-rpc.com"],
        ])("should create contract instance for %s", async (chain, rpcUrl) => {
            const contract = await router.getContractInstance(
                rpcUrl,
                chain as "scroll" | "base",
            );
            expect(contract).toBeDefined();
        });

        it.each(["scroll", "base"])(
            "should create contract with wallet for %s",
            async (chain) => {
                const mockWallet = new Wallet(
                    "0x1234567890123456789012345678901234567890123456789012345678901234",
                );
                const contract = await router.getContractWAccount(
                    mockWallet,
                    chain as "scroll" | "base",
                );
                expect(contract).toBeDefined();
            },
        );

        it("should use correct router addresses", () => {
            expect(router.SCROLL_ROUTER_ADDRESS).toBe(
                "0x4bb92d3f730d5a7976707570228f5cb7e09094c5",
            );
            expect(router.BASE_ROUTER_ADDRESS).toBe(
                "0x274602a953847d807231d2370072F5f4E4594B44",
            );
        });
    });

    describe("Error Handling", () => {
        it("should throw error for invalid chain", async () => {
            await expect(
                router.getContractInstance("https://rpc.com", "invalid" as any),
            ).rejects.toThrow("Invalid chain ID");
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
