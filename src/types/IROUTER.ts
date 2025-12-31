import { Wallet, Contract } from "ethers";
import { Call } from "starknet";
import { AmountType, ProtocolId, RouteResponse, Token } from "./index";
import { CHAIN_MAP } from "./types";
import {
    buildBatchTransactionParams,
    buildRouteAndCalldataParams,
    buildTransactionParams,
    getBestRouteBatchParams,
    getBestRouteParams,
} from "./router-params";

export interface IRouter {
    /**
     * Default Fibrous Router API base URL.
     */
    readonly DEFAULT_API_URL: string;

    /**
     * Graph API base URL used for helper endpoints.
     */
    readonly GRAPH_API_URL: string;

    /**
     * EVM native token address constant (0x000...000).
     */
    readonly NATIVE_TOKEN_ADDRESS: string;

    /**
     * List of supported chains and their router addresses.
     */
    supportedChains: CHAIN_MAP[];

    /**
     * Fetches the best route from the API.
     * @param amount Amount to swap.
     * @param tokenInAddress Input token address.
     * @param tokenOutAddress Output token address.
     * @param chainName Chain name (e.g. "starknet", "scroll").
     * @param options Optional route parameters and overrides.
     * @param chainId Chain ID (may be used instead of `chainName` for backward compatibility).
     * @returns Route response.
     * @throws Error if the chain is not supported.
     */
    getBestRoute(params: getBestRouteParams): Promise<RouteResponse>;

    /**
     * Fetches best routes in batch for multiple inputs.
     * @param amounts List of input amounts.
     * @param tokenInAddresses Input token addresses.
     * @param tokenOutAddresses Output token addresses.
     * @param chainName Chain name.
     * @param options Optional route parameters.
     * @returns List of route responses.
     */
    getBestRouteBatch(
        params: getBestRouteBatchParams,
    ): Promise<RouteResponse[]>;

    /**
     * Returns the supported token list for a given chain.
     * @param chainNameOrId Chain name (e.g. "starknet", "scroll") or chain ID.
     * @returns Map of lowercased symbol -> Token.
     */
    supportedTokens(
        chainNameOrId: string | number,
    ): Promise<Map<string, Token>>;

    /**
     * Returns token details by address.
     * @param tokenAddress Token address.
     * @param chainNameOrId Chain name (e.g. "starknet", "scroll") or chain ID.
     * @returns Token object.
     * @throws ChainNotSupportedError if chain is not supported.
     * @throws APIError if token is not found or API request fails.
     */
    getToken(
        tokenAddress: string,
        chainNameOrId: string | number,
    ): Promise<Token>;

    /**
     * Returns supported protocols.
     * @param chainNameOrId Chain name (e.g. "starknet", "scroll") or chain ID.
     * @returns Mapping of AMM name -> protocol identifier.
     */
    supportedProtocols(
        chainNameOrId: string | number,
    ): Promise<Record<string, ProtocolId>>;

    /**
     * Builds Starknet approve call parameters.
     * @param amount Amount to approve (will be converted to hex).
     * @param tokenAddress ERC-20 token address.
     */
    buildApproveStarknet(
        amount: AmountType,
        tokenAddress: string,
    ): Promise<Call>;

    /**
     * Performs EVM approve if needed and returns the result.
     * @param amount Amount to approve.
     * @param tokenAddress ERC-20 token address.
     * @param account Wallet/signer used for the transaction.
     * @param chainId Chain ID.
     * @returns `true` if allowance is sufficient or approve succeeded.
     */
    buildApproveEVM(
        amount: AmountType,
        tokenAddress: string,
        account: Wallet,
        chainId?: number,
    ): Promise<boolean>;

    /**
     * Legacy method that builds a route and calldata to prepare a transaction.
     * Note: This will be deprecated; prefer `buildRouteAndCalldata`.
     * @param inputAmount Input amount.
     * @param tokenInAddress Input token address.
     * @param tokenOutAddress Output token address.
     * @param slippage Slippage percentage (1 = 1%).
     * @param destination Receiver address.
     * @param chainName Chain name.
     * @param options Optional parameters.
     * @param chainId Chain ID (for backward compatibility).
     * @returns Starknet `Call` or EVM calldata/transaction structure.
     */
    buildTransaction(params: buildTransactionParams): Promise<Call | unknown>;

    /**
     * Returns the best route and executable calldata in a single call.
     * @param inputAmount Input amount.
     * @param tokenInAddress Input token address.
     * @param tokenOutAddress Output token address.
     * @param slippage Slippage percentage (1 = 1%).
     * @param destination Receiver address.
     * @param chainId Chain ID.
     * @param options Optional parameters.
     * @returns Route and calldata structure (includes Starknet swap call when applicable).
     */
    buildRouteAndCalldata(
        params: buildRouteAndCalldataParams,
    ): Promise<Call | unknown>;

    /**
     * Builds calldata/call list for batch transactions (Starknet for now).
     * @param inputAmounts Input amounts.
     * @param tokenInAddresses Input token addresses.
     * @param tokenOutAddresses Output token addresses.
     * @param slippage Slippage percentage.
     * @param destination Receiver address.
     * @param chainName Chain name.
     * @param options Optional parameters.
     * @param chainId Chain ID (for backward compatibility).
     * @returns Array of Starknet `Call`s or chain-specific payload.
     */
    buildBatchTransaction(
        params: buildBatchTransactionParams,
    ): Promise<Call[] | unknown>;

    /**
     * (EVM) Returns a router contract instance with a provider only.
     * @param rpcUrl JSON-RPC URL.
     * @param chainId Chain name (e.g. "starknet", "scroll") or chain ID.
     * @returns Contract instance for EVM networks (ethers.Contract).
     * @throws ChainNotSupportedError if chain is not supported or is Starknet.
     */
    getContractInstance(
        rpcUrl: string,
        chainId: number | string,
    ): Promise<Contract>;

    /**
     * (EVM) Returns a router contract instance ready to sign with the given wallet.
     * @param account Wallet/signer to use.
     * @param chainId Chain name (e.g. "starknet", "scroll") or chain ID.
     * @returns Contract instance for EVM networks (ethers.Contract).
     * @throws ChainNotSupportedError if chain is not supported or is Starknet.
     */
    getContractWAccount(
        account: Wallet,
        chainId: number | string,
    ): Promise<Contract>;

    /**
     * Gets the router address for a given chain.
     * @param chainNameOrId Chain name (e.g. "starknet", "scroll") or chain ID.
     * @returns Router address for the chain.
     * @throws ChainNotSupportedError if chain is not supported.
     */
    getRouterAddress(chainNameOrId: string | number): Promise<string>;
}
