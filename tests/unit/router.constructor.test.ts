import { Router } from "../../src";
import { mockFetch } from "../setup/test-setup";

describe("Router Constructor and Configuration", () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it("should initialize with default configuration", () => {
        const router = new Router();
        expect(router.DEFAULT_API_URL).toBe("https://api.fibrous.finance");
        expect(router.GRAPH_API_URL).toBe("https://graph.fibrous.finance");
        expect(router.STARKNET_ROUTER_ADDRESS).toBe(
            "0x00f6f4CF62E3C010E0aC2451cC7807b5eEc19a40b0FaaCd00CCA3914280FDf5a",
        );
        expect(router.SCROLL_ROUTER_ADDRESS).toBe(
            "0x4bb92d3f730d5a7976707570228f5cb7e09094c5",
        );
        expect(router.BASE_ROUTER_ADDRESS).toBe(
            "0x274602a953847d807231d2370072F5f4E4594B44",
        );
    });
});
