import { Router } from "../../src";
import { ProtocolId } from "../../src/types";
import {
    mockFetch,
    createMockResponse,
    createMockRoute,
} from "../setup/test-setup";

describe("Router Route Options and URL Building", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
        mockFetch.mockClear();
    });

    describe("Route Options and Overrides", () => {
        it("should build the correct URL when no options are provided", async () => {
            const mockRoute = createMockRoute();
            mockFetch.mockResolvedValueOnce(createMockResponse(mockRoute));

            await router.getBestRoute(BigInt(1000), "0x1", "0x2", "starknet");

            expect(mockFetch).toHaveBeenCalledWith(
                `${router.DEFAULT_API_URL}/starknet/route?amount=1000&tokenInAddress=0x1&tokenOutAddress=0x2`,
                { headers: {} },
            );
        });

        it.each([
            {
                description: "with direct option",
                options: { direct: true },
                expectedQuery: "direct=true",
            },
            {
                description: "with reverse option",
                options: { reverse: true },
                expectedQuery: "reverse=true",
            },
            {
                description: "with excluded protocols",
                options: { excludeProtocols: [1, 2] as ProtocolId[] },
                expectedQuery: "excludeProtocols=1%2C2",
            },
            {
                description: "with all options",
                options: {
                    excludeProtocols: [3, 4] as ProtocolId[],
                    direct: true,
                },
                expectedQuery: "excludeProtocols=3%2C4&direct=true",
            },
        ])(
            "should handle route options correctly $description",
            async ({ options, expectedQuery }) => {
                const mockRoute = createMockRoute();
                mockFetch.mockResolvedValueOnce(createMockResponse(mockRoute));

                await router.getBestRoute(
                    BigInt(1000),
                    "0x1",
                    "0x2",
                    "starknet",
                    options,
                );

                const expectedUrl = `${router.DEFAULT_API_URL}/starknet/route?amount=1000&tokenInAddress=0x1&tokenOutAddress=0x2&${expectedQuery}`;
                expect(mockFetch).toHaveBeenCalledWith(expectedUrl, {
                    headers: {},
                });
            },
        );
    });

    describe("URL Building and Type Safety", () => {
        it("should handle complex route parameters and ignore false values", async () => {
            const mockRoute = createMockRoute();
            mockFetch.mockResolvedValueOnce(createMockResponse(mockRoute));

            await router.getBestRoute(
                BigInt("999999999999999999"),
                "0xabcdef1234567890",
                "0x1234567890abcdef",
                "base",
                {
                    excludeProtocols: [1, 5, 10] as ProtocolId[],
                    direct: false,
                    reverse: true,
                },
            );

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain("amount=999999999999999999");
            expect(url).toContain("tokenInAddress=0xabcdef1234567890");
            expect(url).toContain("tokenOutAddress=0x1234567890abcdef");
            expect(url).toContain("excludeProtocols=1%2C5%2C10");
            // Note: false values are not added to URL parameters by default
            expect(url).not.toContain("direct=false");
            expect(url).toContain("reverse=true");
        });
    });
});
