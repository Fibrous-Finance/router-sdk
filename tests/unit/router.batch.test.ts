import { Router } from "../../src";
import { RouteSuccess } from "../../src/types";
import {
    mockFetch,
    createMockResponse,
    createMockRoute,
} from "../setup/test-setup";

describe("Router Batch Operations", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
        mockFetch.mockClear();
    });

    describe("Batch Route Requests", () => {
        it("should handle batch route requests with and without options", async () => {
            const mockBatchRoutes: RouteSuccess[] = [
                createMockRoute({ inputAmount: "1000" }),
                createMockRoute({ inputAmount: "2000" }),
            ];
            mockFetch.mockResolvedValue(createMockResponse(mockBatchRoutes));

            // Case 1: Standard request
            await router.getBestRouteBatch(
                [BigInt(1000), BigInt(2000)],
                ["0x1", "0x2"],
                ["0x3", "0x4"],
                "starknet",
            );
            expect(mockFetch).toHaveBeenLastCalledWith(
                `${router.DEFAULT_API_URL}/starknet/routeBatch?amounts=1000%2C2000&tokenInAddresses=0x1%2C0x2&tokenOutAddresses=0x3%2C0x4`,
                { headers: {} },
            );

            // Case 2: With options
            await router.getBestRouteBatch(
                [BigInt(1000), BigInt(2000)],
                ["0x1", "0x2"],
                ["0x3"],
                "starknet",
                { direct: true },
            );
            expect(mockFetch).toHaveBeenLastCalledWith(
                `${router.DEFAULT_API_URL}/starknet/routeBatch?amounts=1000%2C2000&tokenInAddresses=0x1%2C0x2&tokenOutAddresses=0x3&direct=true`,
                { headers: {} },
            );
        });

        it("should handle single output token for multiple inputs", async () => {
            const mockBatchRoutes: RouteSuccess[] = [
                createMockRoute(),
                createMockRoute(),
                createMockRoute(),
            ];
            mockFetch.mockResolvedValueOnce(
                createMockResponse(mockBatchRoutes),
            );

            await router.getBestRouteBatch(
                [BigInt(100), BigInt(200), BigInt(300)],
                ["0x1", "0x2", "0x3"],
                ["0x4"], // Single output token
                "base",
            );

            expect(mockFetch).toHaveBeenCalledWith(
                `${router.DEFAULT_API_URL}/base/routeBatch?amounts=100%2C200%2C300&tokenInAddresses=0x1%2C0x2%2C0x3&tokenOutAddresses=0x4`,
                { headers: {} },
            );
        });
    });

    describe("Batch Transaction Building", () => {
        it("should build batch transaction for Starknet with and without options", async () => {
            const mockCalldata = [["call1"], ["call2"]];
            mockFetch.mockResolvedValue(createMockResponse(mockCalldata));

            // Case 1: Standard request
            const result = await router.buildBatchTransaction(
                [BigInt(1000), BigInt(2000)],
                ["0x1", "0x2"],
                ["0x3", "0x4"],
                1,
                "0x5",
                "starknet",
            );
            expect(mockFetch).toHaveBeenLastCalledWith(
                `${router.DEFAULT_API_URL}/starknet/executeBatch?amounts=0x3e8%2C0x7d0&tokenInAddresses=0x1%2C0x2&tokenOutAddresses=0x3%2C0x4&slippage=1&destination=0x5`,
                { headers: {} },
            );

            if ("contractAddress" in result) {
                expect(result.calldata).toEqual(["call1"]);
            } else {
                fail("Expected Starknet Call structure");
            }

            // Case 2: With options
            await router.buildBatchTransaction(
                [BigInt(1000)],
                ["0x1"],
                ["0x2"],
                2,
                "0x3",
                "starknet",
                { direct: true },
            );
            expect(mockFetch).toHaveBeenLastCalledWith(
                `${router.DEFAULT_API_URL}/starknet/executeBatch?amounts=0x3e8&tokenInAddresses=0x1&tokenOutAddresses=0x2&slippage=2&destination=0x3&direct=true`,
                { headers: {} },
            );
        });

        it("should handle large batch transactions", async () => {
            const mockCalldata = [
                ["call1"],
                ["call2"],
                ["call3"],
                ["call4"],
                ["call5"],
            ];
            mockFetch.mockResolvedValueOnce(createMockResponse(mockCalldata));

            const amounts = Array(5)
                .fill(0)
                .map((_, i) => BigInt((i + 1) * 1000));
            const tokenInAddresses = Array(5)
                .fill(0)
                .map((_, i) => `0x${i + 1}`);
            const tokenOutAddresses = ["0x6"];

            const result = await router.buildBatchTransaction(
                amounts,
                tokenInAddresses,
                tokenOutAddresses,
                3,
                "0x7",
                "starknet",
            );

            expect(mockFetch).toHaveBeenCalledWith(
                `${router.DEFAULT_API_URL}/starknet/executeBatch?amounts=0x3e8%2C0x7d0%2C0xbb8%2C0xfa0%2C0x1388&tokenInAddresses=0x1%2C0x2%2C0x3%2C0x4%2C0x5&tokenOutAddresses=0x6&slippage=3&destination=0x7`,
                { headers: {} },
            );

            if ("contractAddress" in result) {
                expect(result.contractAddress).toBe(
                    router.STARKNET_ROUTER_ADDRESS,
                );
                expect(result.entrypoint).toBe("swap");
                expect(result.calldata).toEqual(["call1"]);
            }
        });
    });
});
