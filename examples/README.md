<p align="center">
  <a href="https://fibrous.finance">
    <img src="../../../docs/assets/logo.png" width="400px" >
  </a>
</p>

# Fibrous Finance SDK (v1.0.0)

[Full Documentation](https://docs.fibrous.finance/)

## Important Notes

📝 **API Version**: Use `apiVersion: "v2"` in the Router constructor to access the latest API features.

📝 **Function Parameters**: All functions now use parameter objects instead of individual parameters for better type safety and consistency.

📝 **Chain ID**: Functions use `chainId` (number) instead of `chainName` (string) for better performance and consistency.

💡 **Token Access**: `supportedTokens()` returns a `Map<string, Token>`, use `.get(tokenSymbol)` to access tokens.

💡 **Refresh Chains**: Always call `refreshSupportedChains()` before using chain-related functions.

## Usage

### Initialization

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";

// Create a new router instance with v2 API
const fibrous = new FibrousRouter({
    apiVersion: "v2", // optional, v2 is the latest version
    apiKey: "your-api-key", // optional, for API key authentication
});

// Always refresh supported chains first
const chains = await fibrous.refreshSupportedChains();
```

### Fetching Tokens

```javascript
/**
 * Returns the supported verified token list for a given chain.
 * @param chainId Chain ID.
 * @returns Map of lowercased symbol -> Token.
 */

const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
if (!chainId) {
    throw new Error("Chain not supported");
}

// Returns verified tokens
const tokens = await fibrous.supportedTokens(chainId); // returns Map<string, Token>
console.log("Tokens: ", tokens);

// Get a specific token by address (for unverified tokens)
const token = await fibrous.getToken(
    "0x0000000000000000000000000000000000000000",
    chainId,
);
console.log("Token: ", token);
```

### Fetching Protocols

```javascript
/**
 * Returns supported protocols for a given chain
 * @param chainId Chain ID.
 * @returns Mapping of AMM name -> protocol identifier.
 */

const protocols = await fibrous.supportedProtocols(chainId);
console.log(protocols);
```

### Fetching Route

```javascript
import { parseUnits } from "ethers";
import { getBestRouteParams } from "fibrous-router-sdk";

// Build route options
const tokens = await fibrous.supportedTokens(chainId);
const inputToken = tokens.get("usdc");
if (!inputToken) {
    throw new Error("Input token not found");
}

// Get output token by address (for unverified tokens)
const outputToken = await fibrous.getToken(
    "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb",
    chainId,
);
if (!outputToken) {
    throw new Error("Output token not found");
}

const tokenInAddress = inputToken.address;
const tokenOutAddress = outputToken.address;
const tokenInDecimals = Number(inputToken.decimals);
const inputAmount = BigInt(parseUnits("4", tokenInDecimals)); // 4 USDC

const getBestRouteParams: getBestRouteParams = {
    amount: inputAmount,
    tokenInAddress: tokenInAddress,
    tokenOutAddress: tokenOutAddress,
    chainId: chainId,
    options: {
        reverse: false,
    },
};

const route = await fibrous.getBestRoute(getBestRouteParams);
console.log("route", route);
```

### Build Route And Calldata on EVM

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { ethers, parseUnits } from "ethers";
import { account } from "./account";
import { humanReadableEvmSwapCallDataLog } from "../utils/humanReadableEvmLog";
import { monitorTransaction } from "./utils";
import { buildRouteAndCalldataParams } from "fibrous-router-sdk";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const destination = process.env.EVM_PUBLIC_KEY;
const privateKey = process.env.EVM_PRIVATE_KEY;

async function main() {
    const fibrous = new FibrousRouter({
        apiVersion: "v2",
    });
    
    if (!privateKey || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    
    const account0 = account(privateKey, RPC_URL);
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }

    const contractWallet = await fibrous.getContractWAccount(account0 as any, chainId);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const tokens = await fibrous.supportedTokens(chainId);
    const inputToken = tokens.get("usdc");
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("whype");
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken.decimals);
    const inputAmount = BigInt(parseUnits("2", tokenInDecimals));
    const isNativeToken = tokenInAddress == "0x0000000000000000000000000000000000000000";
    const slippage = 0.5; // 0.5%
    
    const buildRouteAndCalldataParams: buildRouteAndCalldataParams = {
        inputAmount: inputAmount,
        tokenInAddress: tokenInAddress,
        tokenOutAddress: tokenOutAddress,
        slippage,
        destination: destination || account0.address,
        chainId: chainId,
    };
    
    const { route, calldata } = await fibrous.buildRouteAndCalldata(buildRouteAndCalldataParams);

    const approveResponse = await fibrous.buildApproveEVM(
        inputAmount,
        tokenInAddress,
        account0 as any,
        chainId,
    );
    
    humanReadableEvmSwapCallDataLog(
        calldata,
        inputToken,
        outputToken,
        await fibrous.supportedProtocols(chainId),
    );
    
    if (approveResponse === true) {
        try {
            if ("route" in calldata && "swap_parameters" in calldata) {
                const feeData = await provider.getFeeData();
                if (!feeData.gasPrice) {
                    console.log("gasPrice not found");
                    return;
                }
                
                let tx;
                if (isNativeToken) {
                    tx = await contractWallet.swap(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            value: inputAmount,
                            gasPrice: feeData.gasPrice * 4n,
                        },
                    );
                } else {
                    tx = await contractWallet.swap(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            gasPrice: feeData.gasPrice * 2n,
                        },
                    );
                }
                await monitorTransaction(tx);
            } else {
                console.error("Invalid swap call data for EVM transaction");
            }
        } catch (e) {
            console.error("Error swapping tokens: ", e);
        }
    } else {
        console.error("Error approving tokens");
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
```

### Build Route And Calldata with Integration (Fee Sharing)

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { ethers, parseUnits } from "ethers";
import { account } from "./account";
import { humanReadableEvmSwapCallDataLog } from "../utils/humanReadableEvmLog";
import { monitorTransaction } from "./utils";
import { buildRouteAndCalldataParams } from "fibrous-router-sdk";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const destination = process.env.EVM_PUBLIC_KEY;
const privateKey = process.env.EVM_PRIVATE_KEY;
const apiKey = process.env.FIBROUS_API_KEY;

async function main() {
    const fibrous = new FibrousRouter({
        apiKey,
        apiVersion: "v2",
    });
    
    if (!privateKey || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    
    const account0 = account(privateKey, RPC_URL);
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }

    const contractWallet = await fibrous.getContractWAccount(account0 as any, chainId);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const tokens = await fibrous.supportedTokens(chainId);
    const inputToken = tokens.get("usdc");
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("whype");
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken.decimals);
    const inputAmount = BigInt(parseUnits("2", tokenInDecimals));
    const isNativeToken = tokenInAddress == "0x0000000000000000000000000000000000000000";
    const slippage = 0.5; // 0.5%
    
    // Integration data for fee sharing
    const buildRouteAndCalldataParams: buildRouteAndCalldataParams = {
        inputAmount: inputAmount,
        tokenInAddress: tokenInAddress,
        tokenOutAddress: tokenOutAddress,
        slippage,
        destination: destination || account0.address,
        chainId: chainId,
        integrationData: {
            integratorAddress: process.env.INTEGRATOR_ADDRESS!,
            integratorFeePercentageBps: Number(process.env.INTEGRATOR_FEE_PERCENTAGE_BPS!),
            integratorSurplusPercentageBps: Number(process.env.INTEGRATOR_SURPLUS_PERCENTAGE_BPS!),
        },
    };
    
    const { route, calldata } = await fibrous.buildRouteAndCalldata(buildRouteAndCalldataParams);

    const approveResponse = await fibrous.buildApproveEVM(
        inputAmount,
        tokenInAddress,
        account0 as any,
        chainId,
    );
    
    humanReadableEvmSwapCallDataLog(
        calldata,
        inputToken,
        outputToken,
        await fibrous.supportedProtocols(chainId),
    );
    
    if (approveResponse === true) {
        try {
            if ("route" in calldata && "swap_parameters" in calldata) {
                const feeData = await provider.getFeeData();
                if (!feeData.gasPrice) {
                    console.log("gasPrice not found");
                    return;
                }
                
                let tx;
                if (isNativeToken) {
                    tx = await contractWallet.swapIntegrator(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            value: inputAmount,
                            gasPrice: feeData.gasPrice * 4n,
                        },
                    );
                } else {
                    // Use swapIntegrator for integration swaps
                    tx = await contractWallet.swapIntegrator(
                        calldata.route,
                        calldata.swap_parameters,
                        calldata.integrator_data,
                        {
                            gasPrice: feeData.gasPrice * 2n,
                        },
                    );
                }
                await monitorTransaction(tx);
            } else {
                console.error("Invalid swap call data for EVM transaction");
            }
        } catch (e) {
            console.error("Error swapping tokens: ", e);
        }
    } else {
        console.error("Error approving tokens");
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
```

### Build Transaction (Legacy Method)

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { ethers, parseUnits } from "ethers";
import { account } from "./account";
import { humanReadableEvmSwapCallDataLog } from "../utils/humanReadableEvmLog";
import { monitorTransaction } from "./utils";
import { buildTransactionParams } from "fibrous-router-sdk";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const destination = process.env.EVM_PUBLIC_KEY;
const privateKey = process.env.EVM_PRIVATE_KEY;

async function main() {
    const fibrous = new FibrousRouter({
        apiVersion: "v2",
    });
    
    if (!privateKey || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    
    const account0 = account(privateKey, RPC_URL);
    const chains = await fibrous.refreshSupportedChains();
    const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }

    const contractWallet = await fibrous.getContractWAccount(account0 as any, chainId);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const tokens = await fibrous.supportedTokens(chainId);
    const inputToken = tokens.get("usdc");
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("whype");
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken.decimals);
    const inputAmount = BigInt(parseUnits("4", tokenInDecimals));
    const isNativeToken = tokenInAddress == "0x0000000000000000000000000000000000000000";
    const slippage = 1; // 1%
    
    const buildTransactionParams: buildTransactionParams = {
        inputAmount: inputAmount,
        tokenInAddress: tokenInAddress,
        tokenOutAddress: tokenOutAddress,
        slippage: slippage,
        destination: destination || account0.address,
        chainId: chainId,
    };
    
    const calldata = await fibrous.buildTransaction(buildTransactionParams);

    const approveResponse = await fibrous.buildApproveEVM(
        inputAmount,
        tokenInAddress,
        account0 as any,
        chainId,
    );
    
    humanReadableEvmSwapCallDataLog(
        calldata,
        inputToken,
        outputToken,
        await fibrous.supportedProtocols(chainId),
    );
    
    if (approveResponse === true) {
        try {
            if ("route" in calldata && "swap_parameters" in calldata) {
                const feeData = await provider.getFeeData();
                if (!feeData.gasPrice) {
                    console.log("gasPrice not found");
                    return;
                }
                
                let tx;
                if (isNativeToken) {
                    tx = await contractWallet.swap(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            value: inputAmount,
                            gasPrice: feeData.gasPrice * 4n,
                        },
                    );
                } else {
                    tx = await contractWallet.swap(
                        calldata.route,
                        calldata.swap_parameters,
                        {
                            gasPrice: feeData.gasPrice * 2n,
                        },
                    );
                }
                await monitorTransaction(tx);
            } else {
                console.error("Invalid swap call data for EVM transaction");
            }
        } catch (e) {
            console.error("Error swapping tokens: ", e);
        }
    } else {
        console.error("Error approving tokens");
    }
}

main().catch((e) => {
    console.error("Error: ", e);
});
```

## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.

[def]: https://docs.fibrous.finance/
