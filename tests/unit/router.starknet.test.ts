import { Router } from "../../src";
import {
    mockFetch,
    createMockResponse,
    createMockRoute,
} from "../setup/test-setup";

describe("Router Starknet-specific Methods", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
        mockFetch.mockClear();
    });

    describe("Starknet Approve", () => {
        it("should build approve transaction for Starknet", async () => {
            const approveCall = await router.buildApproveStarknet(
                BigInt(1000),
                "0x1",
            );

            expect(approveCall).toEqual({
                contractAddress: "0x1",
                entrypoint: "approve",
                calldata: [router.STARKNET_ROUTER_ADDRESS, "0x3e8", "0x0"],
            });
        });

        it("should handle large amounts in approve", async () => {
            const largeAmount = BigInt("999999999999999999999");
            const approveCall = await router.buildApproveStarknet(
                largeAmount,
                "0xabc123",
            );

            expect(approveCall).toEqual({
                contractAddress: "0xabc123",
                entrypoint: "approve",
                calldata: [
                    router.STARKNET_ROUTER_ADDRESS,
                    "0x3635c9adc5de9fffff",
                    "0x0",
                ],
            });
        });
    });

    describe("Starknet Transaction Building", () => {
        it("should build Starknet transaction with and without options", async () => {
            const mockRoute = createMockRoute();
            const mockCalldata = ["0x1", "0x2", "0x3"];

            mockFetch
                .mockResolvedValue(createMockResponse(mockRoute))
                .mockResolvedValueOnce(createMockResponse(mockCalldata))
                .mockResolvedValueOnce(createMockResponse(mockCalldata));

            // Case 1: Standard transaction
            const result = await router.buildTransaction(
                BigInt(1000),
                "0x1",
                "0x2",
                1,
                "0x3",
                "starknet",
            );

            if ("contractAddress" in result) {
                expect(result.contractAddress).toBe(
                    router.STARKNET_ROUTER_ADDRESS,
                );
                expect(result.entrypoint).toBe("swap");
                expect(result.calldata).toEqual(mockCalldata);
            } else {
                fail("Expected Starknet Call structure");
            }

            // Case 2: Transaction with options
            await router.buildTransaction(
                BigInt(5000),
                "0x1",
                "0x2",
                2,
                "0x3",
                "starknet",
                {
                    direct: true,
                    reverse: false,
                },
            );

            expect(mockFetch).toHaveBeenNthCalledWith(
                3, // First call is mockRoute, second is mockCalldata for case 1
                expect.stringContaining(
                    "route?amount=0x1388&tokenInAddress=0x1&tokenOutAddress=0x2&slippage=2&destination=0x3&direct=true",
                ),
                { headers: {} },
            );

            expect(mockFetch).toHaveBeenNthCalledWith(
                4, // Fourth call is mockCalldata for case 2
                expect.stringContaining("helper/calldata"),
                expect.objectContaining({
                    method: "POST",
                }),
            );
        });
    });
});
