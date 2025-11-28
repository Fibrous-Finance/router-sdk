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
        expect(router.supportedChains).toBeDefined();
        expect(router.supportedChains.length).toBeGreaterThan(0);
    });
});
