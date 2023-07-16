import { buildRouteUrl, buildSwapCalldata } from "../utils";
import {
    RouteOptions,
    RouteResponse,
    Token,
    Transaction,
    TransactionConfig,
    ProtocolId,
} from "../types";

export class Router {
    readonly DEFAULT_API_URL = "https://api.fibrous.finance";
    readonly ROUTER_ADDRESS =
        "0x1b23ed400b210766111ba5b1e63e33922c6ba0c45e6ad56ce112e5f4c578e62";

    private readonly apiUrl: string;
    private readonly apiKey: string | null;

    constructor(dedicatedUrl?: string, apiKey?: string) {
        // Trim / at the end
        if (dedicatedUrl && dedicatedUrl.endsWith("/"))
            dedicatedUrl = dedicatedUrl.substring(0, dedicatedUrl.length - 1);
        this.apiUrl = dedicatedUrl ?? this.DEFAULT_API_URL;
        this.apiKey = apiKey ?? null;
    }

    /**
     * Gets the best route from the API
     * @param options: Options for the route
     * @throws
     */
    async getBestRoute(options: RouteOptions): Promise<RouteResponse> {
        const excludeProtocols = (options.excludeProtocols ?? []).join(",");
        const routeParams = Object.assign(options, { excludeProtocols });
        const routeUrl = buildRouteUrl(`${this.apiUrl}/route`, routeParams);
        return await fetch(routeUrl, {
            headers: { "X-API-Key": this.apiKey },
        }).then((response) => response.json());
    }

    /**
     * @returns Supported token list
     */
    async supportedTokens(): Promise<Record<string, Token>> {
        const tokens: Token[] = await fetch(`${this.apiUrl}/tokens`, {
            headers: { "X-API-Key": this.apiKey },
        }).then((response) => response.json());

        // Create a record of tokens by symbol
        return tokens.reduce(
            (acc, token) => Object.assign(acc, { [token.symbol]: token }),
            {}
        );
    }

    /**
     * @returns Supported protocol list
     */
    async supportedProtocols(): Promise<Record<string, ProtocolId>> {
        const protocols: string[] = await fetch(`${this.apiUrl}/protocols`, {
            headers: { "X-API-Key": this.apiKey },
        }).then((response) => response.json());

        // Create a record of protocols, starting from 1
        return protocols.reduce(
            (acc, protocol, idx) =>
                Object.assign(acc, { [protocol]: (idx + 1) as ProtocolId }),
            {}
        );
    }

    /**
     * Builds a Starknet transaction out of the route response
     * @param config: Transaction configuration
     * @returns Starknet transaction
     */
    buildTransaction(config: TransactionConfig): Transaction {
        return {
            contractAddress: this.ROUTER_ADDRESS,
            entryPoint: "swap",
            call_data: buildSwapCalldata(
                config.route,
                config.slippage,
                config.accountAddress
            ),
        };
    }
}
