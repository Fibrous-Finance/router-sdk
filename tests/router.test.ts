import { Router } from "../src";
import * as fs from "fs";

// Helper function to mock the fetch function
global.fetch = jest.fn() as any;
const globalFetch = global.fetch as jest.Mock;
const mockFetchWith = (data: any) => async () => {
    return { json: async () => data };
};

describe("Router", () => {
    let router: Router;

    beforeEach(() => {
        router = new Router();
    });

    it("Should return supported protocols", async () => {
        globalFetch.mockImplementationOnce(mockFetchWith(["amm1", "amm2"]));
        const protocols = await router.supportedProtocols();

        expect(protocols).toEqual({
            amm1: 1,
            amm2: 2,
        });
    });

    it("Should return supported tokens", async () => {
        globalFetch.mockImplementationOnce(
            mockFetchWith([
                { symbol: "eth", address: "0x1" },
                { symbol: "dai", address: "0x2" },
            ]),
        );
        const tokens = await router.supportedTokens();

        expect(tokens).toEqual({
            eth: { symbol: "eth", address: "0x1" },
            dai: { symbol: "dai", address: "0x2" },
        });
    });

    it("Should return best route", async () => {
        const mockRouteData = fs.readFileSync(
            "./tests/mock/routeResponse.json",
            "utf-8",
        );
        globalFetch.mockImplementationOnce(
            mockFetchWith(JSON.parse(mockRouteData)),
        );

        const route = await router.getBestRoute({
            amount: 1,
            tokenInAddress: "0x1",
            tokenOutAddress: "0x2",
        });
        expect(globalFetch).lastCalledWith(
            `${router.DEFAULT_API_URL}/route?amount=1&tokenInAddress=0x1&tokenOutAddress=0x2`,
            { headers: {} },
        );
        expect(route).toEqual(JSON.parse(mockRouteData));
    });

    it("Should convert route to transaction", async () => {
        const mockRouteData = fs.readFileSync(
            "./tests/mock/routeResponse.json",
            "utf-8",
        );
        globalFetch.mockImplementationOnce(
            mockFetchWith(JSON.parse(mockRouteData)),
        );

        const route = await router.getBestRoute({
            amount: 1,
            tokenInAddress: "0x1",
            tokenOutAddress: "0x2",
        });
        expect(route.success).toEqual(true);
        if (route.success === false) return;
        expect(route.outputAmount).toEqual("2000000000000000000000");

        const transaction = router.buildTransaction({
            route,
            slippage: 0.05,
            accountAddress: "0x3",
        });
        expect(transaction).toEqual({
            contractAddress: router.ROUTER_ADDRESS,
            entryPoint: "swap",
            call_data: [
                "1", // swap length
                "0x1", // swap #1 token in address
                "0x2", // swap #1 token out address
                "1000000", // swap #1 rate
                "2", // swap #1 protocol
                "0xPOOL", // swap #1 pool address
                "0x1", // token in
                "0x2", // token out
                "0x" + 1000000000000000000n.toString(16), // amount in [0]
                "0x0", // amount out [1]
                "0x" + 1900000000000000000000n.toString(16), // min received [0]
                "0x0", // min received [1]
                "0x3", // receiver
            ],
        });
    });
});
