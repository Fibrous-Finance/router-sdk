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
import { Router as FibrousRouter } from "fibrous-router-sdk";

const router = new FibrousRouter();

const chainId = router.supportedChains.find(chain => chain.chain_name === "base")?.chain_id;
if (!chainId) {
    throw new Error("Chain not supported");
}

const tokens = await router.supportedTokens(chainId); // returns Map<string, Token>
// Access tokens like: tokens.get("usdc") or tokens.get("eth")
```

Fetching route

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

const router = new FibrousRouter();

const chainId = router.supportedChains.find(chain => chain.chain_name === "base")?.chain_id;
if (!chainId) {
    throw new Error("Chain not supported");
}

const tokens = await router.supportedTokens(chainId);
const inputToken = await router.getToken(
  "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  chainId, // Use chainId instead of chainName
);
if (!inputToken) {
  throw new Error("Input token not found");
}
const tokenInAddress = inputToken.address;
const tokenOutAddress = tokens.get("usdc")?.address; // Use .get() method for Map
if (!tokenOutAddress) {
    throw new Error("Output token not found");
}
const tokenInDecimals = Number(inputToken.decimals);
const inputAmount = BigInt(parseUnits("5", tokenInDecimals));

const route = await router.getBestRoute(
  inputAmount, // amount
  tokenInAddress, // token input
  tokenOutAddress, // token output
  "base", // chainName (will be deprecated, use chainId instead)
  {}, // options
  chainId, // chainId parameter
);
// returns route type (src/types/route.ts)
```

Build transaction on Base

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import { account } from "./account";

// RPC URL for the Base network, you can change this to the RPC URL of your choice
const RPC_URL = process.env.BASE_RPC_URL;
// Destination address for the swap
const destination = process.env.EVM_PUBLIC_KEY;
// Private key of the account that will be used to sign the transaction
const privateKey = process.env.EVM_PRIVATE_KEY;

const chainName = "base";
// Create a new router instance
const fibrous = new FibrousRouter();

const chainId = fibrous.supportedChains.find(chain => chain.chain_name === "base")?.chain_id;
if (!chainId) {
    throw new Error("Chain not supported");
}

// Create a new contract instance
const account0 = account(privateKey, RPC_URL);
const contractwwallet = await fibrous.getContractWAccount(account0, chainId);
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Build route options
const tokens = await fibrous.supportedTokens(chainId);
const inputToken = await fibrous.getToken(
  "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  chainId, // Use chainId instead of chainName
);
if (!inputToken) {
  throw new Error("Input token not found");
}
const tokenInAddress = inputToken.address;
const tokenOutAddress = tokens.get("usdc")?.address; // Use .get() method
if (!tokenOutAddress) {
    throw new Error("Output token not found");
}
const tokenInDecimals = Number(inputToken.decimals);
const inputAmount = BigInt(parseUnits("5", tokenInDecimals));

// Call the buildTransaction method in order to build the transaction
// slippage: The maximum acceptable slippage of the buyAmount amount.
const slippage = 1;
const swapCall = await fibrous.buildTransaction(
  inputAmount,
  tokenInAddress,
  tokenOutAddress,
  slippage,
  destination,
  "base", // chainName (will be deprecated)
  {}, // options
  chainId, // chainId parameter
);

const approveResponse = await fibrous.buildApproveEVM(
  inputAmount,
  tokenInAddress,
  account0,
  chainId, // Use chainId instead of chainName
);
if (approveResponse === true) {
  try {
    // Type guard: EVM chains return EvmTransactionData
    if ("route" in swapCall && "swap_parameters" in swapCall) {
      const feeData = await provider.getFeeData();
      if (!feeData.gasPrice) {
        console.log("gasPrice not found");
        return;
      }
      
      // Check if native token (ETH) to include value
      const isNativeToken = tokenInAddress === "0x0000000000000000000000000000000000000000";
      
      const tx = await contractwwallet.swap(
        swapCall.route,
        swapCall.swap_parameters,
        {
          gasPrice: feeData.gasPrice * 2n,
          value: isNativeToken ? inputAmount : undefined, // Include value for native token swaps
        },
      );
      await tx.wait();
      console.log(`https://basescan.org/tx/${tx.hash}`);
    } else {
      console.error("Invalid swap call data for EVM transaction");
    }
  } catch (e) {
    console.error("Error swapping tokens: ", e);

  }
} else {
  console.error("Error approving tokens - make sure you have sufficient balance");
}
```

## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.

[def]: https://docs.fibrous.finance/
