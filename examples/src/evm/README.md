<p align="center">
  <a href="https://fibrous.finance">
    <img src="../../../docs/assets/logo.png" width="400px" >
  </a>
</p>

# Fibrous Finance SDK (v0.6.0)

[Full Documentation](https://docs.fibrous.finance/)

## Important Notes

📝 **Function Parameters**: Most functions now use `chainId` (number) instead of `chainName` (string) for better performance and consistency.

💡 **Token Access**: `supportedTokens()` returns a `Map<string, Token>`, use `.get(tokenSymbol)` to access tokens.
## Usage

Fetching Tokens

```javascript
 /**
 * Returns the supported verified token list for a given chain.
 * @param chainId Chain ID.
 * @returns Map of lowercased symbol -> Token.
 */

import { Router as FibrousRouter } from "fibrous-router-sdk";

// Example of getting a list of tokens
const router = new FibrousRouter();
const chainId = router.supportedChains.find(chain => chain.chain_name == "base")?.chain_id;
if (!chainId) {
throw new Error("Chain not supported");
}
// returns verified tokens
const tokens = await router.supportedTokens(chainId); // returns Map<string, Token>
console.log("Tokens: ", tokens);
// Get a specific token by address
const token = await router.getToken(
    "0x0000000000000000000000000000000000000000",
    chainId,
);
console.log("Token: ", token);
  

```

Fetching Protocols

```javascript

/**
 * Returns supported protocols for a given chain
 * @param chainId Chain ID.
 * @returns Mapping of AMM name -> protocol identifier.
 */
import { Router as FibrousRouter } from "fibrous-router-sdk";b

const router = new FibrousRouter();
const chainId = router.supportedChains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
if (!chainId) {
    throw new Error("Chain not supported");
}

const protocols = await router.supportedProtocols(chainId);
console.log(protocols);
```

Fetching route

```javascript

import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

// Create a new router instance
const fibrous = new FibrousRouter();
const chainId = fibrous.supportedChains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
if (!chainId) {
    throw new Error("Chain not supported");
}

// Build route options
const tokens = await fibrous.supportedTokens(chainId);
// Get input token from tokens map
const inputToken = tokens.get("hype");
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
const inputAmount = BigInt(parseUnits("1", tokenInDecimals)); // 1 Hype

const route = await fibrous.getBestRoute(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    "hyperevm", // chainName will be deprecated in the future, use chainId instead
    {
        reverse: false,
    },
    chainId,
);

```

Build Route And Calldata on EVM

```javascript
// import { Router as FibrousRouter } from "fibrous-router-sdk";
import { Router as FibrousRouter } from "../../../src";
import {  ethers, parseUnits } from "ethers";
import { account } from "./account";
import { humanReadableEvmSwapCallDataLog } from "../utils/humanReadableEvmLog";
import dotenv from "dotenv";
import { monitorTransaction } from "./utils";

dotenv.config();
// RPC URL for the EVM network, you can change this to the RPC URL of your choice
const RPC_URL = process.env.HYPER_EVM_RPC_URL;
// Destination address for the swap (optional)
const destination = process.env.EVM_PUBLIC_KEY;
// Private key of the account that will be used to sign the transaction
const privateKey = process.env.EVM_PRIVATE_KEY;

async function main() {
    const fibrous = new FibrousRouter();
    if (!privateKey || !RPC_URL || !destination) {
        throw new Error("Missing environment variables");
    }
    // Create a new contract instance
    const account0 = account(privateKey, RPC_URL);
    const chainId = fibrous.supportedChains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
    if (!chainId) {
        throw new Error("Chain not supported");
    }

    const contractWallet = await fibrous.getContractWAccount(account0 as any, chainId);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    // Build route options
    const tokens = await fibrous.supportedTokens(chainId);
    const inputToken = tokens.get("hype");
    if (!inputToken) {
        throw new Error("Input token not found");
    }
    const tokenInAddress = inputToken.address;
    const outputToken = tokens.get("khype");
    if (!outputToken) {
        throw new Error("Output token not found");
    }
    const tokenOutAddress = outputToken.address;
    const tokenInDecimals = Number(inputToken.decimals);
    const inputAmount = BigInt(parseUnits("10", tokenInDecimals));
    const isNativeToken = tokenInAddress == "0x0000000000000000000000000000000000000000";
    // Build route and calldata
    const {route, calldata} = await fibrous.buildRouteAndCalldata(
        inputAmount,
        tokenInAddress,
        tokenOutAddress,
        1, // slippage
        destination || account0.address,
        chainId,
    );

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
            // Type guard: EVM chains return EvmTransactionData
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
