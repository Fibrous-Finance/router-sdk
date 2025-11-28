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
            const result2 = await router.buildBatchTransaction(
                [BigInt(1000), BigInt(2000)],
                ["0x1", "0x2"],
                ["0x3", "0x4"],
                1,
                "0x5",
                "starknet",
                undefined,
                23448594291968336,
            );
            expect(mockFetch).toHaveBeenLastCalledWith(
                `${router.DEFAULT_API_URL}/starknet/executeBatch?amounts=1000%2C2000&tokenInAddresses=0x1%2C0x2&tokenOutAddresses=0x3%2C0x4&slippage=1&destination=0x5`,
                { headers: {} },
            );

            // Check if result is an array of Call objects (Starknet batch)
            if (Array.isArray(result2)) {
                expect(result2).toHaveLength(2);
                expect(result2[0]).toEqual({
                    contractAddress:
                        "0x00f6f4cf62e3c010e0ac2451cc7807b5eec19a40b0faacd00cca3914280fdf5a",
                    entrypoint: "swap",
                    calldata: ["call1"],
                });
                expect(result2[1]).toEqual({
                    contractAddress:
                        "0x00f6f4cf62e3c010e0ac2451cc7807b5eec19a40b0faacd00cca3914280fdf5a",
                    entrypoint: "swap",
                    calldata: ["call2"],
                });
            } else {
                throw new Error("Expected array of Starknet Call structures");
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
                `${router.DEFAULT_API_URL}/starknet/executeBatch?amounts=1000&tokenInAddresses=0x1&tokenOutAddresses=0x2&slippage=2&destination=0x3&direct=true`,
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
                `${router.DEFAULT_API_URL}/starknet/executeBatch?amounts=1000%2C2000%2C3000%2C4000%2C5000&tokenInAddresses=0x1%2C0x2%2C0x3%2C0x4%2C0x5&tokenOutAddresses=0x6&slippage=3&destination=0x7`,
                { headers: {} },
            );

            // Check if result is an array of Call objects (Starknet batch)
            if (Array.isArray(result)) {
                expect(result).toHaveLength(5);
                result.forEach((call, index) => {
                    expect(call.contractAddress).toBe(
                        "0x00f6f4cf62e3c010e0ac2451cc7807b5eec19a40b0faacd00cca3914280fdf5a",
                    );
                    expect(call.entrypoint).toBe("swap");
                    expect(call.calldata).toEqual([`call${index + 1}`]);
                });
            } else {
                throw new Error("Expected array of Starknet Call structures");
            }
        });
    });
});
