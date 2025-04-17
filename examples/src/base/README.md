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
const chainName = "base";
const router = new FibrousRouter();
const tokens = await router.supportedTokens(chainName); // returns array as token type (src/types/token.ts)
```

Fetching route

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const router = new FibrousRouter();
const chainName = "base";

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

Build transaction on Base

```javascript
import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import { account } from "./account";

// RPC URL for the Base network, you can change this to the RPC URL of your choice
const RPC_URL = "https://mainnet.base.org";
// Destination address for the swap
const destination = "<DESTINATION_ADDRESS>";
// Private key of the account that will be used to sign the transaction
const privateKey = "<PRIVATE_KEY>";

const chainName = "base";
// Create a new router instance
const fibrous = new FibrousRouter();

// Create a new contract instance
const account0 = account(privateKey, RPC_URL);
const contractwwallet = await fibrous.getContractWAccount(account0, chainName);

// Build route options
const tokens = await fibrous.supportedTokens(chainName);

const tokenInAddress = tokens["usdt"].address;
const tokenOutAddress = tokens["usdc"].address;
const tokenInDecimals = Number(tokens["usdt"].decimals);
const inputAmount = BigNumber.from(5n * 10n ** BigInt(tokenInDecimals));

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
        const tx = await contractwwallet.swap(
            swapCall.route,
            swapCall.swap_parameters,
        );
        await tx.wait();
        console.log(`https://basescan.com/tx/${tx.hash}`);
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
