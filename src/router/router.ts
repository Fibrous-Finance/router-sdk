import { approveToERC20, buildHeaders, buildRouteUrl } from "../utils";
import {
    RouteParams,
    RouteResponse,
    Token,
    ProtocolId,
    RouteOverrides,
    RouteExecuteParams,
} from "../types";
import { BigNumber } from "@ethersproject/bignumber";
import { Call } from "starknet";
export class Router {
    readonly DEFAULT_API_URL = "https://api.fibrous.finance";
    readonly ROUTER_ADDRESS =
        "0x00f6f4CF62E3C010E0aC2451cC7807b5eEc19a40b0FaaCd00CCA3914280FDf5a";

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
     * @param amount: Amount to swap, formatted
     * @param tokenInAddress: Token to swap from
     * @param tokenOutAddress: Token to swap to
     * @param options: Optional parameters
     * @returns Route response
     * @throws Error if the API returns an error
     */
    async getBestRoute(
        amount: BigNumber,
        tokenInAddress: string,
        tokenOutAddress: string,
        options?: Partial<RouteOverrides>,
    ): Promise<RouteResponse> {
        // Create params object
        const routeParams: RouteParams = {
            amount,
            tokenInAddress,
            tokenOutAddress,
        };

        // Add optional parameters
        for (const [key, value] of Object.entries(options ?? {})) {
            if (key == "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
                continue;
            }
            routeParams[key as any] = value;
        }

        const routeUrl = buildRouteUrl(`${this.apiUrl}/route`, routeParams);
        return await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
    }

    /**
     * @returns Supported token list
     */
    async supportedTokens(): Promise<Record<string, Token>> {
        const tokens: Token[] = await fetch(`${this.apiUrl}/tokens`, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        // Create a record of tokens by symbol
        return tokens.reduce(
            (acc, token) => Object.assign(acc, { [token.symbol]: token }),
            {},
        );
    }

    /**
     * @returns Supported protocol list
     */
    async supportedProtocols(): Promise<Record<string, ProtocolId>> {
        const protocols: string[] = await fetch(`${this.apiUrl}/protocols`, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        // Create a record of protocols, starting from 1
        return protocols.reduce(
            (acc, protocol, idx) =>
                Object.assign(acc, { [protocol]: (idx + 1) as ProtocolId }),
            {},
        );
    }

    /**
     * Builds a Starknet approve transaction
     * @param amount: Amount to approve, formatted
     * @param tokenAddress: Token to approve
     */
    async buildApprove(amount: BigNumber, tokenAddress: string): Promise<Call> {
        const amountHex = amount.toHexString();
        const approveCall = approveToERC20(
            amountHex,
            tokenAddress,
            this.ROUTER_ADDRESS,
        );
        return approveCall;
    }

    /**
     * Builds a Starknet transaction out of the route response
     * @param route: Route response
     * @param slippage: Slippage percentage (0.01 = 1%)
     * @param receiverAddress: Address to receive the tokens
     */
    async buildTransaction(
        inputAmount: BigNumber,
        tokenInAddress: string,
        tokenOutAddress: string,
        slippage: number,
        destination: string,
        options?: Partial<RouteOverrides>,
    ): Promise<Call> {
        const amount = inputAmount.toHexString();
        const routeParams: RouteExecuteParams = {
            amount,
            tokenInAddress,
            tokenOutAddress,
            slippage,
            destination,
        };

        // Add optional parameters
        for (const [key, value] of Object.entries(options ?? {})) {
            if (key == "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
                continue;
            }
            routeParams[key as any] = value;
        }

        const routeUrl = buildRouteUrl(`${this.apiUrl}/execute`, routeParams);
        const calldata = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
        return {
            contractAddress: this.ROUTER_ADDRESS,
            entrypoint: "swap",
            calldata: calldata,
        };
    }
}
