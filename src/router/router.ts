import { approveToERC20, buildHeaders, buildRouteUrl } from "../utils";
import {
    RouteParams,
    RouteResponse,
    Token,
    ProtocolId,
    RouteOverrides,
    RouteExecuteParams,
    RouteExecuteBatchParams,
} from "../types";
import { fibrousRouterABI, erc20ABI, baseRouterAbi } from "../abis";
import { BigNumber } from "@ethersproject/bignumber";
import { ethers, Wallet } from "ethers";
import { Call } from "starknet";

export class Router {
    readonly DEFAULT_API_URL = "https://api.fibrous.finance";
    readonly GRAPH_API_URL = "https://graph.fibrous.finance";
    readonly STARKNET_ROUTER_ADDRESS =
        "0x00f6f4CF62E3C010E0aC2451cC7807b5eEc19a40b0FaaCd00CCA3914280FDf5a";
    readonly SCROLL_ROUTER_ADDRESS =
        "0x4bb92d3f730d5a7976707570228f5cb7e09094c5";
    readonly BASE_ROUTER_ADDRESS = "0x274602a953847d807231d2370072F5f4E4594B44";

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
        chainName: string,
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

        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chainName}/route`,
            routeParams,
        );
        return await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
    }

    /**
     * @param chainName Chain ID to get the supported tokens for
     * @returns Supported token list
     */
    async supportedTokens(chainName: string): Promise<Record<string, Token>> {
        const tokens: Token[] = await fetch(
            `${this.GRAPH_API_URL}/${chainName}/tokens`,
            {
                headers: buildHeaders(this.apiKey),
            },
        ).then((response) => response.json());

        // Create a record of tokens by symbol
        return tokens.reduce(
            (acc, token) =>
                Object.assign(acc, {
                    [token.symbol.toLocaleLowerCase()]: token,
                }),
            {},
        );
    }
    /**
     *
     * @param address Token address
     * @param chainName Chain ID to get the token for
     * @returns Token object
     */

    async getToken(address: string, chainName: string): Promise<Token | null> {
        const token: Token = await fetch(
            `${this.GRAPH_API_URL}/${chainName}/tokens/${address}`,
            {
                headers: buildHeaders(this.apiKey),
            },
        ).then((response) => response.json());
        return token;
    }

    /**
     * @returns Supported protocol list
     */
    async supportedProtocols(
        chainName: string,
    ): Promise<Record<string, ProtocolId>> {
        const protocols: { amm_name: string; protocol: ProtocolId }[] =
            await fetch(`${this.GRAPH_API_URL}/${chainName}/protocols`, {
                headers: buildHeaders(this.apiKey),
            }).then((response) => response.json());

        return protocols.reduce(
            (acc, protocol) =>
                Object.assign(acc, { [protocol.amm_name]: protocol.protocol }),
            {},
        );
    }

    /**
     * Builds a Starknet approve transaction
     * @param amount: Amount to approve, formatted
     * @param tokenAddress: Token to approve
     */
    async buildApproveStarknet(
        amount: BigNumber,
        tokenAddress: string,
    ): Promise<Call> {
        const amountHex = amount.toHexString();
        const approveCall = approveToERC20(
            amountHex,
            tokenAddress,
            this.STARKNET_ROUTER_ADDRESS,
        );
        return approveCall;
    }

    /**
     * Builds a EVM approve transaction
     * @param amount: Amount to approve, formatted
     * @param tokenAddress: Token to approve
     * @param account: Wallet to use
     * @param chainName: Chain ID to get the router address for
     */
    async buildApproveEVM(
        amount: BigNumber,
        tokenAddress: string,
        account: Wallet,
        chainName: string,
    ): Promise<boolean> {
        if (chainName == "scroll") {
            const tokenContract = new ethers.Contract(
                tokenAddress,
                erc20ABI,
                account,
            );
            const allowance = await tokenContract.allowance(
                await account.getAddress(),
                this.SCROLL_ROUTER_ADDRESS,
            );
            if (Number(allowance) >= Number(amount)) {
                return true;
            }
            const approveTx = await tokenContract.approve(
                this.SCROLL_ROUTER_ADDRESS,
                amount.toString(),
            );
            await approveTx.wait();
            return true;
        } else if (chainName == "base") {
            const tokenContract = new ethers.Contract(
                tokenAddress,
                erc20ABI,
                account,
            );
            const allowance = await tokenContract.allowance(
                await account.getAddress(),
                this.BASE_ROUTER_ADDRESS,
            );
            if (Number(allowance) >= Number(amount)) {
                return true;
            }
            const approveTx = await tokenContract.approve(
                this.BASE_ROUTER_ADDRESS,
                amount.toString(),
            );
            await approveTx.wait();
            return true;
        } else {
            throw new Error("Invalid chain ID");
        }
    }

    /**
     * Builds a Starknet, Scroll or Base transaction out of the route response
     * @param route: Route response
     * @param slippage: Slippage percentage (1 = 1%)
     * @param receiverAddress: Address to receive the tokens
     */
    async buildTransaction(
        inputAmount: BigNumber,
        tokenInAddress: string,
        tokenOutAddress: string,
        slippage: number,
        destination: string,
        chainName: string,
        options?: Partial<RouteOverrides>,
    ): Promise<Call | any> {
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

        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chainName}/route`,
            routeParams,
        );
        const route = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
        const calldataParams = {
            route_response: route,
            signer: destination,
            slippage: slippage,
        };
        const calldataUrl = `${this.GRAPH_API_URL}/${chainName}/helper/calldata`;
        const calldata = await fetch(calldataUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...buildHeaders(this.apiKey),
            },
            body: JSON.stringify(calldataParams),
        }).then((response) => response.json());
        if (chainName == "starknet") {
            return {
                contractAddress: this.STARKNET_ROUTER_ADDRESS,
                entrypoint: "swap",
                calldata: calldata,
            };
        } else if (chainName == "scroll" || chainName == "base") {
            return calldata;
        } else {
            throw new Error("Invalid chain ID");
        }
    }

    /**
     * Builds a Batch transaction out of the route response (only on Starknet for now)
     * @param route: Route response
     * @param slippage: Slippage percentage (1 = 1%)
     * @param receiverAddress: Address to receive the tokens
     */
    async buildBatchTransaction(
        inputAmounts: BigNumber[],
        tokenInAddresses: string[],
        tokenOutAddresses: string[],
        slippage: number,
        destination: string,
        chainName: string,
        options?: Partial<RouteOverrides>,
    ): Promise<Call | any> {
        const amounts = inputAmounts.map((amount) => amount.toHexString());
        const routeParams: RouteExecuteBatchParams = {
            amounts,
            tokenInAddresses,
            tokenOutAddresses,
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

        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chainName}/executeBatch`,
            routeParams,
        );
        const calldata = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        if (chainName == "starknet") {
            const swapCalls = calldata.map((call: any) => {
                return {
                    contractAddress: this.STARKNET_ROUTER_ADDRESS,
                    entrypoint: "swap",
                    calldata: call,
                };
            });
            return swapCalls;
        } else {
            throw new Error("Invalid chain ID");
        }
    }

    /**
     * Create a contract instance for the Scroll or Base Router
     * @param rpcUrl RPC URL to connect to
     * @returns Contract instance
     */
    async getContractInstance(rpcUrl: string, chainName: string) {
        if (chainName == "scroll") {
            const contract = new ethers.Contract(
                this.SCROLL_ROUTER_ADDRESS,
                fibrousRouterABI,
                new ethers.JsonRpcProvider(rpcUrl),
            );
            return contract;
        } else if (chainName == "base") {
            const contract = new ethers.Contract(
                this.BASE_ROUTER_ADDRESS,
                baseRouterAbi,
                new ethers.JsonRpcProvider(rpcUrl),
            );
            return contract;
        } else {
            throw new Error("Invalid chain ID");
        }
    }

    /**
     * Create a contract instance for the Scroll or Base Router with a wallet
     * @param account Wallet to use
     * @returns Contract instance
     */
    async getContractWAccount(account: Wallet, chainName: string) {
        if (chainName == "scroll") {
            const contract = new ethers.Contract(
                this.SCROLL_ROUTER_ADDRESS,
                fibrousRouterABI,
                account,
            );
            return contract;
        } else if (chainName == "base") {
            const contract = new ethers.Contract(
                this.BASE_ROUTER_ADDRESS,
                baseRouterAbi,
                account,
            );
            return contract;
        } else {
            throw new Error("Invalid chain ID");
        }
    }
}
