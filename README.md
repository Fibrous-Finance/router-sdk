<p align="center">
  <a href="https://fibrous.finance">
    <img src="./docs/assets/logo.png" width="400px" >
  </a>
</p>

# Fibrous Finance SDK (v0.3.4)

## Installation

```bash
# NPM
npm install fibrous-router-sdk

# Yarn
yarn add fibrous-router-sdk

# PNPM
pnpm add fibrous-router-sdk
```

[Full Documentation](https://docs.fibrous.finance/)

## Usage

Fetching Tokens

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
const chainName = "starknet"; // or "scroll"
const router = new FibrousRouter();
const tokens = await router.supportedTokens(chainName); // returns array as token type (src/types/token.ts)
```

Fetching route

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const router = new FibrousRouter();
const chainName = "starknet"; // or "scroll"

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

Build transaction on Starknet

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { connect, disconnect } from '@argent/get-starknet'
import { Account, Provider } from "starknet";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const fibrous = new FibrousRouter();

const chainName = "starknet"

const tokens = await fibrous.supportedTokens();
const tokenInAddress = tokens["eth"].address;
const tokenOutAddress = tokens["usdc"].address;
const tokenInDecimals = tokens["eth"].decimals;
const inputAmount = BigNumber.from(1n * 10n ** BigInt(tokenInDecimals));

// Usage on your website

const starknet = await connect({ showList: false })

await starknet.enable()

if (starknet.isConnected) {

  // Call the buildTransaction method in order to build the transaction
  // slippage: The maximum acceptable slippage of the buyAmount amount.
  const slippage = 1; // %1
  const receiverAddress = starknet.selectedAddress; // The address to receive the tokens after the swap is completed (required)

  const approveCall:Call = await fibrous.buildApproveStarknet(
      inputAmount,
      tokenInAddress,
  );

  const swapCall = await fibrous.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage,
    receiverAddress,
    chainName
  );

  await starknet.account.execute([approveCall,swapCall]);
}


// Usage on backend

const provider = new Provider();
const privateKey0 = "YOUR_PRIVATE_KEY";
const accountAddress0 = "YOUR_WALLET_ADDRESS";
// https://www.starknetjs.com/docs/guides/connect_account
// If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter
const RPC_URL = "RPC_URL";
const account0 = account(privateKey, public_key, "1", RPC_URL);

// Call the buildTransaction method in order to build the transaction
// slippage: The maximum acceptable slippage of the buyAmount amount.
const slippage = 1; // %1
const swapCall = await fibrous.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage,
    receiverAddress,
    chainName
);

const approveCall:Call = await fibrous.buildApprove(
      inputAmount,
      tokenInAddress,
  );

await account.execute([approveCall, swapCall])

```

Build transaction on Scroll

```javascript
import { BigNumber } from "@ethersproject/bignumber";
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";
import { account } from "./account";

// RPC URL for the Scroll network, you can change this to the RPC URL of your choice
const RPC_URL = "https://rpc.scroll.io";
// Destination address for the swap
const destination = "<DESTINATION_ADDRESS>";
// Private key of the account that will be used to sign the transaction
const privateKey = "<PRIVATE_KEY>";

const chainName = "scroll";
// Create a new router instance
const fibrous = new FibrousRouter();

// Create a new contract instance
const account0 = account(privateKey, RPC_URL);
const contractwwallet = await fibrous.getContractWAccount(account0, "scroll");

// Build route options
const tokens = await fibrous.supportedTokens("scroll");

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
        console.log(`https://scrollscan.com/tx/${tx.hash}`);
    } catch (e) {
        console.error("Error swapping tokens: ", e);
    }
} else {
    console.error("Error approving tokens");
}
```

Check out the [examples](./examples) folder for more detailed examples.

## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.

[def]: https://docs.fibrous.finance/
