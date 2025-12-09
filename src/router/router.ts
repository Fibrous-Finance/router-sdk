import {
    approveToERC20,
    buildHeaders,
    buildRouteUrl,
    buildRouteUrlBatch,
    APIError,
    NetworkError,
    JSONParseError,
    ChainNotSupportedError,
    validateAmount,
    validateSlippage,
    validateIntegrationData,
    validateBatchParams,
} from "../utils";
import {
    RouteParams,
    RouteResponse,
    Token,
    ProtocolId,
    RouteExecuteParams,
    RouteExecuteBatchParams,
    RouteParamsBatch,
    AmountType,
    constructorParams,
    BuildTransactionResponse,
    RouteAndCalldataResponse,
} from "../types";
import { fibrousRouterABI, erc20ABI, evmRouterAbi } from "../abis";
import { ethers, Wallet, Contract } from "ethers";
import { Call } from "starknet";
import { CHAIN_MAP } from "../types/";
import { IRouter } from "../types";
import { buildBatchTransactionParams, buildRouteAndCalldataParams, buildTransactionParams, getBestRouteBatchParams, getBestRouteParams } from "../types/router";

export class Router implements IRouter {
    readonly DEFAULT_API_URL = "https://api.fibrous.finance";
    readonly GRAPH_API_URL = "https://graph.fibrous.finance";
    public supportedChains: CHAIN_MAP[] = [];
    readonly NATIVE_TOKEN_ADDRESS =
        "0x0000000000000000000000000000000000000000";
    private readonly apiUrl: string;
    private readonly apiKey: string | null;
    private readonly apiVersion: string | null;
    private chainsLoaded = false;
    private loadingPromise: Promise<CHAIN_MAP[]> | null = null;

    constructor({ apiKey, dedicatedUrl, apiVersion }: constructorParams = {}) {
        // Trim / at the end
        if (dedicatedUrl && dedicatedUrl.endsWith("/"))
            dedicatedUrl = dedicatedUrl.substring(0, dedicatedUrl.length - 1);
        this.apiUrl = dedicatedUrl ?? this.DEFAULT_API_URL;
        this.apiKey = apiKey ?? null;
        this.apiVersion = apiVersion ?? null;
    }

    /**
     * Fetches the supported chains from the API and updates the local cache
     * @returns List of supported chains
     */
    async refreshSupportedChains(): Promise<CHAIN_MAP[]> {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = (async () => {
            try {
                const response = await fetch(
                    `${this.GRAPH_API_URL}/supported-chains`,
                    {
                        headers: buildHeaders(this.apiKey),
                    },
                );
                if (!response.ok) {
                    throw new APIError(
                        `Failed to fetch supported chains: ${response.status} ${response.statusText}`,
                        response.status,
                        response.statusText,
                    );
                }
                const chains = (await response.json()) as CHAIN_MAP[];
                this.supportedChains = chains;
                this.chainsLoaded = true;
                return chains;
            } catch (error) {
                if (error instanceof APIError) {
                    throw error;
                }
                if (error instanceof SyntaxError) {
                    throw new JSONParseError(
                        "Failed to parse supported chains response as JSON",
                        error,
                    );
                }
                throw new NetworkError(
                    "Network request failed while fetching supported chains",
                    error,
                );
            } finally {
                this.loadingPromise = null;
            }
        })();

        return this.loadingPromise;
    }

    private async ensureChainsLoaded(): Promise<void> {
        if (this.chainsLoaded && this.supportedChains.length > 0) {
            return;
        }
        await this.refreshSupportedChains();
    }

    private getChain(chainNameOrId: string | number): CHAIN_MAP {
        let chain: CHAIN_MAP | undefined;
        if (typeof chainNameOrId === "number") {
            chain = this.supportedChains.find(
                (c) => c.chain_id === chainNameOrId,
            );
        } else {
            chain = this.supportedChains.find(
                (c) => c.chain_name === chainNameOrId,
            );
        }

        if (!chain) {
            throw new ChainNotSupportedError(chainNameOrId);
        }
        return chain;
    }


    /**
     * @param chainName Chain ID to get the supported tokens for
     * @returns Supported token list
     */
    async supportedTokens(
        chainNameOrId: string | number,
    ): Promise<Map<string, Token>> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainNameOrId);
        const chainName = chain.chain_name;

        try {
            const response = await fetch(
                `${this.GRAPH_API_URL}/${chainName}/tokens`,
                {
                    headers: buildHeaders(this.apiKey),
                },
            );
            
            if (!response.ok) {
                throw new APIError(
                    `Failed to fetch supported tokens: ${response.status} ${response.statusText}`,
                    response.status,
                    response.statusText,
                );
            }
            
            const tokens: Token[] = await response.json();

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
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse API response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching supported tokens",
                error,
            );
        }
    }

    /**
     *
     * @param address Token address
     * @param chainName Chain ID to get the token for
     * @returns Token object
     */

    async getToken(
        tokenAddress: string,
        chainNameOrId: string | number,
    ): Promise<Token> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainNameOrId);
        const chainName = chain.chain_name;

        try {
            const response = await fetch(
                `${this.GRAPH_API_URL}/${chainName}/tokens/${tokenAddress}`,
                {
                    headers: buildHeaders(this.apiKey),
                },
            );
            
            if (!response.ok) {
                throw new APIError(
                    `Failed to fetch token: ${response.status} ${response.statusText}`,
                    response.status,
                    response.statusText,
                );
            }
            
            const token: Token = await response.json();
            return token;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse API response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching token",
                error,
            );
        }
    }

    /**
     * @returns Supported protocol list
     */
    async supportedProtocols(
        chainNameOrId: string | number,
    ): Promise<Record<string, ProtocolId>> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainNameOrId);
        const chainName = chain.chain_name;

        try {
            const response = await fetch(`${this.GRAPH_API_URL}/${chainName}/protocols`, {
                headers: buildHeaders(this.apiKey),
            });
            
            if (!response.ok) {
                throw new APIError(
                    `Failed to fetch supported protocols: ${response.status} ${response.statusText}`,
                    response.status,
                    response.statusText,
                );
            }
            
            const protocols: { amm_name: string; protocol: ProtocolId }[] =
                await response.json();

            return protocols.reduce(
                (acc, protocol) =>
                    Object.assign(acc, { [protocol.amm_name]: protocol.protocol }),
                {},
            );
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse API response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching supported protocols",
                error,
            );
        }
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
        params: getBestRouteParams,
    ): Promise<RouteResponse> {
        // Validate inputs
        validateAmount(params.amount, "amount");
        if (params.integrationData) {
            validateIntegrationData(params.integrationData);
        }

        await this.ensureChainsLoaded();
        const chain = this.getChain(params.chainId ?? params.chainName!);

        // Create params object
        const routeParams: RouteParams = {
            amount: params.amount,
            tokenInAddress: params.tokenInAddress,
            tokenOutAddress: params.tokenOutAddress,
            integrationData: params.integrationData,
        };

        // Add optional parameters
        if (params.options) {
            if (params.options.reverse !== undefined) {
                routeParams.reverse = params.options.reverse;
            }
            if (params.options.direct !== undefined) {
                routeParams.direct = params.options.direct;
            }
            if (params.options.excludeProtocols) {
                routeParams.excludeProtocols = params.options.excludeProtocols.join(",");
            }
        }

        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/route`,
            routeParams,
        );
        
        try {
            const response = await fetch(routeUrl, {
                headers: buildHeaders(this.apiKey),
            });
            
            if (!response.ok) {
                throw new APIError(
                    `Failed to fetch route: ${response.status} ${response.statusText}`,
                    response.status,
                    response.statusText,
                );
            }
            
            const data = await response.json();
            return data as RouteResponse;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse API response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching route",
                error,
            );
        }
    }

    async getBestRouteBatch(
        params: getBestRouteBatchParams,
    ): Promise<RouteResponse[]> {
        // Validate inputs
        validateBatchParams(
            params.amounts,
            params.tokenInAddresses,
            params.tokenOutAddresses,
        );
        if (params.integrationData) {
            validateIntegrationData(params.integrationData);
        }

        await this.ensureChainsLoaded();
        // Validate chain exists even if we use chainName directly
        const chain = this.getChain(params.chainId ?? params.chainName!);

        const routeParams: RouteParamsBatch = {
            amounts: params.amounts,
            tokenInAddresses: params.tokenInAddresses,
            tokenOutAddresses: params.tokenOutAddresses,
            integrationData: params.integrationData,
        };

        if (params.options) {
            if (params.options.reverse !== undefined) {
                routeParams.reverse = params.options.reverse;
            }
            if (params.options.direct !== undefined) {
                routeParams.direct = params.options.direct;
            }
            if (params.options.excludeProtocols) {
                routeParams.excludeProtocols = params.options.excludeProtocols.join(",");
            }
        }

        const routeUrl = buildRouteUrlBatch(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/routeBatch`,
            routeParams,
        );

        try {
            const response = await fetch(routeUrl, {
                headers: buildHeaders(this.apiKey),
            });
            
            if (!response.ok) {
                throw new APIError(
                    `Failed to fetch batch routes: ${response.status} ${response.statusText}`,
                    response.status,
                    response.statusText,
                );
            }
            
            const data = await response.json();
            return data as RouteResponse[];
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse API response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching batch routes",
                error,
            );
        }
    }



    /**
     * Builds a Starknet, Scroll or Base transaction out of the route response
     * @param route: Route response
     * @param slippage: Slippage percentage (1 = 1%)
     * @param receiverAddress: Address to receive the tokens
     * @Attention: This function will be deprecated, use buildRouteAndCalldata instead
     */
    async buildTransaction(
        params: buildTransactionParams,
    ): Promise<BuildTransactionResponse> {
        // Validate inputs
        validateAmount(params.inputAmount, "inputAmount");
        validateSlippage(params.slippage, "slippage");
        if (params.integrationData) {
            validateIntegrationData(params.integrationData);
        }

        await this.ensureChainsLoaded();
        const chain = this.getChain(params.chainId ?? params.chainName!);

        const amount = params.inputAmount.toString();
        const routeParams: RouteExecuteParams = {
            amount,
            tokenInAddress: params.tokenInAddress,
            tokenOutAddress: params.tokenOutAddress,
            slippage: params.slippage,
            destination: params.destination,
            integrationData: params.integrationData,
        };

        // Add optional parameters
        if (params.options) {
            if (params.options.reverse !== undefined) {
                routeParams.reverse = params.options.reverse;
            }
            if (params.options.direct !== undefined) {
                routeParams.direct = params.options.direct;
            }
            if (params.options.excludeProtocols) {
                routeParams.excludeProtocols = params.options.excludeProtocols.join(",");
            }
        }
        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/route`,
            routeParams,
        );
        
        let route: RouteResponse;
        try {
            const routeResponse = await fetch(routeUrl, {
                headers: buildHeaders(this.apiKey),
            });
            
            if (!routeResponse.ok) {
                throw new APIError(
                    `Failed to fetch route: ${routeResponse.status} ${routeResponse.statusText}`,
                    routeResponse.status,
                    routeResponse.statusText,
                );
            }
            
            route = await routeResponse.json();
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse route response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching route",
                error,
            );
        }
        
        const calldataParams = {
            route: route,
            destination: params.destination,
            slippage: params.slippage,
        };
        const calldataUrl = `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/calldata`;
        
        try {
            const calldataResponse = await fetch(calldataUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...buildHeaders(this.apiKey),
                },
                body: JSON.stringify(calldataParams),
            });
            
            if (!calldataResponse.ok) {
                throw new APIError(
                    `Failed to fetch calldata: ${calldataResponse.status} ${calldataResponse.statusText}`,
                    calldataResponse.status,
                    calldataResponse.statusText,
                );
            }
            
            const calldata = await calldataResponse.json();
            
            if (chain.chain_name === "starknet") {
                return {
                    contractAddress: chain.router_address,
                    entrypoint: "swap",
                    calldata: calldata,
                };
            } else {
                return calldata;
            }
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse calldata response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching calldata",
                error,
            );
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
        params: buildRouteAndCalldataParams,
    ): Promise<RouteAndCalldataResponse> {
        // Validate inputs
        validateAmount(params.inputAmount, "inputAmount");
        validateSlippage(params.slippage, "slippage");
        if (params.integrationData) {
            validateIntegrationData(params.integrationData);
        }

        await this.ensureChainsLoaded();
        const chain = this.getChain(params.chainId ?? params.chainName!);

        const amount = params.inputAmount.toString();
        const routeParams: RouteExecuteParams = {
            amount,
            tokenInAddress: params.tokenInAddress,
            tokenOutAddress: params.tokenOutAddress,
            slippage: params.slippage,
            destination: params.destination,
            integrationData: params.integrationData,
        };

        // Add optional parameters
        if (params.options) {
            if (params.options.reverse !== undefined) {
                routeParams.reverse = params.options.reverse;
            }
            if (params.options.direct !== undefined) {
                routeParams.direct = params.options.direct;
            }
            if (params.options.excludeProtocols) {
                routeParams.excludeProtocols = params.options.excludeProtocols.join(",");
            }
        }

        let calldataUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/routeAndCalldata`,
            routeParams,
        );

        if(chain.chain_name === "starknet") { // for starknet, the calldata will be deleted in the future
            calldataUrl =buildRouteUrl( `${this.apiUrl}/${chain.chain_name}/calldata`, routeParams);
        }
        
        try {
            const calldataResponse = await fetch(calldataUrl, {
                headers: buildHeaders(this.apiKey),
            });
            
            if (!calldataResponse.ok) {
                throw new APIError(
                    `Failed to fetch route and calldata: ${calldataResponse.status} ${calldataResponse.statusText}`,
                    calldataResponse.status,
                    calldataResponse.statusText,
                );
            }
            
            const data = await calldataResponse.json();

            if (chain.chain_name === "starknet") {
                return {
                    route: data.route,
                    calldata: {
                        contractAddress: chain.router_address,
                        entrypoint: "swap",
                        calldata: data.calldata,
                    },
                };
            } else {
                return data;
            }
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse route and calldata response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching route and calldata",
                error,
            );
        }
    }

    /**
     * Builds a Batch transaction out of the route response (only on Starknet for now)
     * @param route: Route response
     * @param slippage: Slippage percentage (1 = 1%)
     * @param receiverAddress: Address to receive the tokens
     */
    async buildBatchTransaction(
        params: buildBatchTransactionParams,
    ): Promise<Call[]> {

        validateSlippage(params.slippage, "slippage");
        if (params.integrationData) {
            validateIntegrationData(params.integrationData);
        }

        await this.ensureChainsLoaded();
        const chain = this.getChain(params.chainId ?? params.chainName!);

        const amounts = params.inputAmounts.map((amount) => amount.toString());
        const routeParams: RouteExecuteBatchParams = {
            amounts,
            tokenInAddresses: params.tokenInAddresses,
            tokenOutAddresses: params.tokenOutAddresses,
            slippage: params.slippage,
            destination: params.destination,
            integrationData: params.integrationData,
        };

        // Add optional parameters
        if (params.options) {
            if (params.options.reverse !== undefined) {
                routeParams.reverse = params.options.reverse;
            }
            if (params.options.direct !== undefined) {
                routeParams.direct = params.options.direct;
            }
            if (params.options.excludeProtocols) {
                routeParams.excludeProtocols = params.options.excludeProtocols.join(",");
            }
        }

        const routeUrl = buildRouteUrlBatch(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/executeBatch`,
            routeParams,
        );
        
        try {
            const response = await fetch(routeUrl, {
                headers: buildHeaders(this.apiKey),
            });
            
            if (!response.ok) {
                throw new APIError(
                    `Failed to fetch batch transaction: ${response.status} ${response.statusText}`,
                    response.status,
                    response.statusText,
                );
            }
            
            const calldata = await response.json();

            if (chain.chain_name === "starknet") {
                const swapCalls: Call[] = (calldata as string[][]).map((call: string[]) => {
                    return {
                        contractAddress: chain.router_address,
                        entrypoint: "swap",
                        calldata: call,
                    };
                });
                return swapCalls;
            } else {
                throw new ChainNotSupportedError(
                    `Batch transactions are only supported on Starknet, got: ${chain.chain_name}`,
                );
            }
        } catch (error) {
            if (error instanceof APIError || error instanceof ChainNotSupportedError) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new JSONParseError(
                    "Failed to parse batch transaction response as JSON",
                    error,
                );
            }
            throw new NetworkError(
                "Network request failed while fetching batch transaction",
                error,
            );
        }
    }

    /**
     * Create a contract instance for the Scroll or Base Router
     * @param rpcUrl RPC URL to connect to
     * @returns Contract instance
     */
    async getContractInstance(
        rpcUrl: string,
        chainId: number | string,
    ): Promise<Contract> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainId);

        if (chain.chain_name === "scroll") {
            const contract = new ethers.Contract(
                chain.router_address,
                fibrousRouterABI,
                new ethers.JsonRpcProvider(rpcUrl),
            );
            return contract;
        } else if (chain.chain_name !== "starknet") {
            const contract = new ethers.Contract(
                chain.router_address,
                evmRouterAbi,
                new ethers.JsonRpcProvider(rpcUrl),
            );
            return contract;
        } else {
            throw new ChainNotSupportedError(
                `Contract instances are not supported for Starknet, got: ${chain.chain_name}`,
            );
        }
    }

    /**
     * Create a contract instance for the evm router with a wallet
     * @param account Wallet to use
     * @returns Contract instance
     */
    async getContractWAccount(
        account: Wallet,
        chainId: number | string,
    ): Promise<Contract> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainId);

        if (chain.chain_name === "scroll") {
            const contract = new ethers.Contract(
                chain.router_address,
                fibrousRouterABI,
                account,
            );
            return contract;
        } else if (chain.chain_name !== "starknet") {
            const contract = new ethers.Contract(
                chain.router_address,
                evmRouterAbi,
                account,
            );
            return contract;
        } else {
            throw new ChainNotSupportedError(
                `Contract instances are not supported for Starknet, got: ${chain.chain_name}`,
            );
        }
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
        // Validate inputs
        validateAmount(amount, "amount");

        await this.ensureChainsLoaded();
        const chain = this.getChain("starknet");

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
        // Validate inputs
        validateAmount(amount, "amount");

        if (tokenAddress === this.NATIVE_TOKEN_ADDRESS) {
            return true;
        }
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainId!);
        const routerAddress = chain.router_address;

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
}
