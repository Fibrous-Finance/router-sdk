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
    IntegrationData,
    constructorParams,
} from "../types";
import { fibrousRouterABI, erc20ABI, evmRouterAbi } from "../abis";
import { ethers, Wallet } from "ethers";
import { BigNumberish, Call } from "starknet";
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
                    throw new Error(
                        `Failed to fetch supported chains: ${response.status} ${response.statusText}`,
                    );
                }
                const chains = (await response.json()) as CHAIN_MAP[];
                this.supportedChains = chains;
                this.chainsLoaded = true;
                return chains;
            } catch (error) {
                console.error("Failed to fetch supported chains:", error);
                throw error;
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
            throw new Error(`Chain not supported: ${chainNameOrId}`);
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

    async getToken(
        tokenAddress: string,
        chainNameOrId: string | number,
    ): Promise<Token> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainNameOrId);
        const chainName = chain.chain_name;

        const token: Token = await fetch(
            `${this.GRAPH_API_URL}/${chainName}/tokens/${tokenAddress}`,
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
        chainNameOrId: string | number,
    ): Promise<Record<string, ProtocolId>> {
        await this.ensureChainsLoaded();
        const chain = this.getChain(chainNameOrId);
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
        for (const [key, value] of Object.entries(params.options ?? {})) {
            if (key === "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (routeParams as any)[key] = value;
        }

        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/route`,
            routeParams,
        );
        return await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
    }

    async getBestRouteBatch(
        params: getBestRouteBatchParams,
    ): Promise<RouteResponse[]> {
        await this.ensureChainsLoaded();
        // Validate chain exists even if we use chainName directly
        const chain = this.getChain(params.chainId ?? params.chainName!);

        const routeParams: RouteParamsBatch = {
            amounts: params.amounts,
            tokenInAddresses: params.tokenInAddresses,
            tokenOutAddresses: params.tokenOutAddresses,
            integrationData: params.integrationData,
        };

        for (const [key, value] of Object.entries(params.options ?? {})) {
            if (key === "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (routeParams as any)[key] = value;
        }

        const routeUrl = buildRouteUrlBatch(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/routeBatch`,
            routeParams,
        );

        const response = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        return response;
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
    ): Promise<Call | any> {
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
        for (const [key, value] of Object.entries(params.options ?? {})) {
            if (key === "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (routeParams as any)[key] = value;
        }
        const routeUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/route`,
            routeParams,
        );
        const route = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());
        const calldataParams = {
            route_response: route,
            signer: params.destination,
            slippage: params.slippage,
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

        if (chain.chain_name === "starknet") {
            return {
                contractAddress: chain.router_address,
                entrypoint: "swap",
                calldata: calldata,
            };
        } else {
            return calldata;
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
    ): Promise<Call | any> {
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
        for (const [key, value] of Object.entries(params.options ?? {})) {
            if (key === "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (routeParams as any)[key] = value;
        }

        let calldataUrl = buildRouteUrl(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/routeAndCalldata`,
            routeParams,
        );

        if(chain.chain_name === "starknet") { // for starknet, the calldata will be deleted in the future
            calldataUrl =buildRouteUrl( `${this.apiUrl}/${chain.chain_name}/calldata`, routeParams);
        }
        const calldataResponse = await fetch(calldataUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        if (chain.chain_name === "starknet") {
            return {
                route: calldataResponse.route,
                calldata: {
                    contractAddress: chain.router_address,
                    entrypoint: "swap",
                    calldata: calldataResponse.calldata,
                },
            };
        } else {
            return calldataResponse;
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
    ): Promise<Call[] | any> {
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
        for (const [key, value] of Object.entries(params.options ?? {})) {
            if (key === "excludeProtocols") {
                routeParams.excludeProtocols = (value as ProtocolId[]).join(
                    ",",
                );
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (routeParams as any)[key] = value;
        }

        const routeUrl = buildRouteUrlBatch(
            `${this.apiUrl}/${chain.chain_name}${this.apiVersion ? `/${this.apiVersion}` : ''}/executeBatch`,
            routeParams,
        );
        const calldata = await fetch(routeUrl, {
            headers: buildHeaders(this.apiKey),
        }).then((response) => response.json());

        if (chain.chain_name === "starknet") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    async getContractInstance(
        rpcUrl: string,
        chainId: number | string,
    ): Promise<any> {
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
            throw new Error("Invalid chain ID");
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
    ): Promise<any> {
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
            throw new Error("Invalid chain ID");
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
