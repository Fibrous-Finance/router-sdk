import {
    approveToERC20,
    buildHeaders,
    buildRouteUrl,
    buildRouteUrlBatch,
} from "../utils";
import {
    RouteParams,
    RouteResponse,
    Token,
    ProtocolId,
    RouteOverrides,
    RouteExecuteParams,
    RouteExecuteBatchParams,
    RouteParamsBatch,
    AmountType,
} from "../types";
import { fibrousRouterABI, erc20ABI, baseRouterAbi } from "../abis";
import { ethers, Wallet } from "ethers";
import { BigNumberish, Call } from "starknet";
import { CHAIN_MAP } from "../types/";
import { CHAIN_ID_MAP } from "../constants";
import { IRouter } from "../types";

export class Router implements IRouter {
    readonly DEFAULT_API_URL = "https://api.fibrous.finance";
    readonly GRAPH_API_URL = "https://graph.fibrous.finance";
    public supportedChains: CHAIN_MAP[] = CHAIN_ID_MAP;
    readonly NATIVE_TOKEN_ADDRESS =
        "0x0000000000000000000000000000000000000000";
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
        amount: AmountType,
        tokenInAddress: string,
        tokenOutAddress: string,
        chainName: string,
        options?: Partial<RouteOverrides>,
        chainId?: number,
    ): Promise<RouteResponse> {
        let chain;
        if (chainId) {
            chain = this.supportedChains.find(
                (chain) => chain.chain_id == chainId,
            );
        } else {
            chain = this.supportedChains.find(
                (chain) => chain.chain_name == chainName,
            );
        }
        if (!chain) {
            throw new Error("Chain not supported");
        }
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
            `${this.apiUrl}/${chain ? chain.chain_name : chainName}/route`,
            routeParams,
        );
        return await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
    }

    async getBestRouteBatch(
        amounts: bigint[] | string[] | number[] | BigNumberish[],
        tokenInAddresses: string[],
        tokenOutAddresses: string[],
        chainName: string,
        options?: Partial<RouteOverrides>,
    ): Promise<RouteResponse[]> {
        const routeParams: RouteParamsBatch = {
            amounts,
            tokenInAddresses,
            tokenOutAddresses,
        };

        for (const [key, value] of Object.entries(options ?? {})) {
            if (key == "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
            }
            routeParams[key as any] = value;
        }

        const routeUrl = buildRouteUrlBatch(
            `${this.apiUrl}/${chainName}/routeBatch`,
            routeParams,
        );

        const response = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        return response;
    }

    /**
     * @param chainName Chain ID to get the supported tokens for
     * @returns Supported token list
     */
    async supportedTokens(chainId: number): Promise<Map<string, Token>> {
        const chain = this.supportedChains.find(
            (chain) => chain.chain_id == chainId,
        );
        if (!chain) {
            throw new Error("Chain not supported");
        }
        const chainName = chain.chain_name;
        const tokens: Token[] = await fetch(
            `${this.GRAPH_API_URL}/${chainName}/tokens`,
            {
                headers: buildHeaders(this.apiKey),
            },
        ).then((response) => response.json());

        // Create a record of tokens by symbol
        const tokensMap = new Map<string, Token>();
        tokens.forEach((token) => {
            const symbol = token.symbol.toLocaleLowerCase();
            // Only add token if symbol doesn't already exist in map
            if (!tokensMap.has(symbol)) {
                tokensMap.set(symbol, token);
            }
        });
        return tokensMap;
    }

    /**
     *
     * @param address Token address
     * @param chainName Chain ID to get the token for
     * @returns Token object
     */

    async getToken(address: string, chainId: number): Promise<Token | null> {
        const chain = this.supportedChains.find(
            (chain) => chain.chain_id == chainId,
        );
        if (!chain) {
            throw new Error("Chain not supported");
        }
        const chainName = chain.chain_name;
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
        chainId: number,
    ): Promise<Record<string, ProtocolId>> {
        const chain = this.supportedChains.find(
            (chain) => chain.chain_id == chainId,
        );
        if (!chain) {
            throw new Error("Chain not supported");
        }
        const chainName = chain.chain_name;
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
        amount: AmountType,
        tokenAddress: string,
    ): Promise<Call> {
        const chain = this.supportedChains.find(
            (chain) => chain.chain_id == 23448594291968336,
        );
        if (!chain) {
            throw new Error("Starknet is not supported");
        }
        const amountHex = "0x" + amount.toString(16);
        const approveCall = approveToERC20(
            amountHex,
            tokenAddress,
            chain.router_address,
        );
        return approveCall;
    }

    /**
     * Builds a EVM approve transaction
     * @param amount: Amount to approve, formatted
     * @param tokenAddress: Token to approve
     * @param account: Wallet to use
     * @param chainId: Chain ID to get the router address for
     */
    async buildApproveEVM(
        amount: AmountType,
        tokenAddress: string,
        account: Wallet,
        chainId?: number,
    ): Promise<boolean> {
        if (tokenAddress == this.NATIVE_TOKEN_ADDRESS) {
            return true;
        }
        const routerAddress = this.supportedChains.find(
            (chain) => chain.chain_id == chainId,
        )?.router_address;
        if (!routerAddress) {
            throw new Error("Router address not found");
        }
        const tokenContract = new ethers.Contract(
            tokenAddress,
            erc20ABI,
            account,
        );
        const allowance = await tokenContract.allowance(
            await account.getAddress(),
            routerAddress,
        );
        if (Number(allowance) >= Number(amount)) {
            return true;
        }
        const approveTx = await tokenContract.approve(
            routerAddress,
            amount.toString(),
        );
        await approveTx.wait();
        return true;
    }

    /**
     * Builds a Starknet, Scroll or Base transaction out of the route response
     * @param route: Route response
     * @param slippage: Slippage percentage (1 = 1%)
     * @param receiverAddress: Address to receive the tokens
     * @Attention: This function will be deprecated, use buildRouteAndCalldata instead
     */
    async buildTransaction(
        inputAmount: AmountType,
        tokenInAddress: string,
        tokenOutAddress: string,
        slippage: number,
        destination: string,
        chainName: string,
        options?: Partial<RouteOverrides>,
        chainId?: number,
    ): Promise<Call | any> {     
        let chain;
        // we will keep both chainName and chainId for backward compatibility
        if (chainId) {
            chain = this.supportedChains.find(
                (chain) => chain.chain_id == chainId,
            );
        } else {
            chain = this.supportedChains.find(
                (chain) => chain.chain_name == chainName,
            );
        }
        if (!chain) {
            throw new Error("Chain not supported");
        }
        const amount = inputAmount.toString();
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
            `${this.apiUrl}/${chain.chain_name}/route`,
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
        const calldataUrl = `${this.GRAPH_API_URL}/${chain.chain_name}/helper/calldata`;
        const calldata = await fetch(calldataUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...buildHeaders(this.apiKey),
            },
            body: JSON.stringify(calldataParams),
        }).then((response) => response.json());

        if (chain.chain_id == 23448594291968336) {
            return {
                contractAddress: chain.router_address,
                entrypoint: "swap",
                calldata: calldata,
            };
        }else {
            return calldata
        }
    }

    /**
     * Builds a route and calldata out of the route response
     * @param inputAmount: Amount to swap, formatted
     * @param tokenInAddress: Token to swap from
     * @param tokenOutAddress: Token to swap to
     * @param slippage: Slippage percentage (1 = 1%)
     * @param destination: Address to receive the tokens
     * @param chainId: Chain ID
     * @param options: Optional parameters
     * @returns Route and calldata response
     * @throws Error if the chain is not supported
     */
    async buildRouteAndCalldata(
        inputAmount: AmountType,
        tokenInAddress: string,
        tokenOutAddress: string,
        slippage: number,
        destination: string,
        chainId: number,
        options?: Partial<RouteOverrides>,
    ): Promise<Call | any> {     
        const chain = this.supportedChains.find(
                (chain) => chain.chain_id == chainId,
            );
        if (!chain) {
            throw new Error("Chain not supported");
        }
    
    
        const amount = inputAmount.toString();
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
    

        const calldataUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}/calldata`,
            routeParams,
        );
        const calldataResponse = await fetch(calldataUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
     

        if (chain.chain_id == 23448594291968336) {
            return {
                route: calldataResponse.route,
                calldata: {
                contractAddress: chain.router_address,
                entrypoint: "swap",
                calldata: calldataResponse.calldata,
                }
            };
        }else {
            return calldataResponse
        }
    }

    /**
     * Builds a Batch transaction out of the route response (only on Starknet for now)
     * @param route: Route response
     * @param slippage: Slippage percentage (1 = 1%)
     * @param receiverAddress: Address to receive the tokens
     */
    async buildBatchTransaction(
        inputAmounts: AmountType[],
        tokenInAddresses: string[],
        tokenOutAddresses: string[],
        slippage: number,
        destination: string,
        chainName: string,
        options?: Partial<RouteOverrides>,
        chainId?: number,
    ): Promise<Call[] | any> {
        let chain;
        if (chainId) {
            chain = this.supportedChains.find(
                (chain) => chain.chain_id == chainId,
            );
        } else {
            chain = this.supportedChains.find(
                (chain) => chain.chain_name == chainName,
            );
        }
        if (!chain) {
            throw new Error("Chain not supported");
        }
        const amounts = inputAmounts.map((amount) => amount.toString());
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
            `${this.apiUrl}/${chain.chain_name}/executeBatch`,
            routeParams,
        );
        const calldata = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        if (chain.chain_id == 23448594291968336) {
            const swapCalls = calldata.map((call: any) => {
                return {
                    contractAddress: chain.router_address,
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
    async getContractInstance(rpcUrl: string, chainId?: number) {
        const chain = this.supportedChains.find(
            (chain) => chain.chain_id == chainId,
        );
        if (!chain) {
            throw new Error("Chain not supported");
        }
        if (chain.chain_name == "scroll") {
            const contract = new ethers.Contract(
                chain.router_address,
                fibrousRouterABI,
                new ethers.JsonRpcProvider(rpcUrl),
            );
            return contract;
        } else if (chain.chain_name != 'starknet') {
            const contract = new ethers.Contract(
                chain.router_address,
                baseRouterAbi,
                new ethers.JsonRpcProvider(rpcUrl),
            );
            return contract;
        } else {
            throw new Error("Invalid chain ID");
        }
    }

    /**
     * Create a contract instance for the evm router with a wallet
     * @param account Wallet to use
     * @returns Contract instance
     */
    async getContractWAccount(account: Wallet, chainId?: number) {
        const chain = this.supportedChains.find(
            (chain) => chain.chain_id == chainId,
        );
        if (!chain) {
            throw new Error("Chain not supported");
        }
        if (chain.chain_name == "scroll") {
            const contract = new ethers.Contract(
                chain.router_address,
                fibrousRouterABI,
                account,
            );
            return contract;
        } else if (chain.chain_name != 'starknet') {
            const contract = new ethers.Contract(
                chain.router_address,
                baseRouterAbi,
                account,
            );
            return contract;
        } else {
            throw new Error("Invalid chain ID");
        }
    }
}
