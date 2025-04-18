<p align="center">
  <a href="https://fibrous.finance">
    <img src="./docs/assets/logo.png" width="400px" >
  </a>
</p>

# Fibrous Finance SDK (v0.4.0)

[Full Documentation](https://docs.fibrous.finance/)

## Usage

Fetching Tokens

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
const chainName = "scroll";
const router = new FibrousRouter();
const tokens = await router.supportedTokens(chainName); // returns array as token type (src/types/token.ts)
```

Fetching route

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const router = new FibrousRouter();
const chainName = "scroll";

const tokenInAddress = tokens["eth"].address;
const tokenOutAddress = tokens["usdc"].address;
const tokenInDecimals = tokens["eth"].decimals;
const inputAmount = BigNumber.from(1n * 10n ** BigInt(tokenInDecimals));

const route = await fibrous.getBestRoute(
    inputAmount, // amount
    tokenInAddress, // token input
    tokenOutAddress, // token output
    chainName,
);
// returns route type (src/types/route.ts)
```

Build transaction on Scroll

```javascript
import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import { account } from "./account";

// RPC URL for the Scroll network, you can change this to the RPC URL of your choice
const RPC_URL = process.env.SCROLL_RPC_URL;
// Destination address for the swap (required)
const destination = process.env.EVM_PUBLIC_KEY;
// Private key of the account that will be used to sign the transaction
const privateKey = process.env.EVM_PRIVATE_KEY;

const chainName = "scroll";
// Create a new router instance
const fibrous = new FibrousRouter();

// Create a new contract instance
const account0 = account(privateKey, RPC_URL);
const contractwwallet = await fibrous.getContractWAccount(account0, chainName);
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Build route options
const tokens = await fibrous.supportedTokens(chainName);
const inputToken = await fibrous.getToken(
    "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
    "scroll",
);
if (!inputToken) {
    throw new Error("Input token not found");
}
const tokenInAddress = inputToken.address;
const tokenOutAddress = tokens["usdc"].address;
const tokenInDecimals = Number(inputToken.decimals);
const inputAmount = BigNumber.from(parseUnits("5", tokenInDecimals));

// Call the buildTransaction method in order to build the transaction
// slippage: The maximum acceptable slippage of the buyAmount amount.
const slippage = 1;
const swapCall = await fibrous.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage,
    destination,
    chainName,
);

const approveResponse = await fibrous.buildApproveEVM(
    inputAmount,
    tokenInAddress,
    account0,
    chainName,
);
if (approveResponse === true) {
    try {
      const feeData = await provider.getFeeData();
            if (!feeData.gasPrice) {
                console.log("gasPrice not found");
                return;
            }
            const tx = await contractwwallet.swap(
                swapCall.route,
                swapCall.swap_parameters,
                {
                    gasPrice: feeData.gasPrice * 2n,
                }
            );
        await tx.wait();
        console.log(`https://scrollscan.com/tx/${tx.hash}`);
    } catch (e) {
        console.error("Error swapping tokens: ", e);
    }
} else {
    console.error("Error approving tokens");
}
```

## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.

[def]: https://docs.fibrous.finance/
