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

const router = new FibrousRouter();
const tokens = await router.supportedTokens(); // returns array as token type (src/types/token.ts)
```

Fetching route

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const router = new FibrousRouter();

const tokenInAddress = tokens["eth"].address;
const tokenOutAddress = tokens["usdc"].address;
const tokenInDecimals = tokens["eth"].decimals;
const inputAmount = BigNumber.from(parseUnits("1", tokenInDecimals));

const route = await fibrous.getBestRoute(
    inputAmount, // amount
    tokenInAddress, // token input
    tokenOutAddress, // token output
);
// returns route type (src/types/route.ts)
```

Build transaction

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { connect, disconnect } from '@argent/get-starknet'
import { Account, Provider } from "starknet";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const fibrous = new FibrousRouter();

const tokens = await fibrous.supportedTokens();
const tokenInAddress = tokens["eth"].address;
const tokenOutAddress = tokens["usdc"].address;
const tokenInDecimals = tokens["eth"].decimals;
const inputAmount = BigNumber.from(parseUnits("1", tokenInDecimals));

// Usage on your website

const starknet = await connect({ showList: false })

await starknet.enable()

if (starknet.isConnected) {

  // Call the buildTransaction method in order to build the transaction
  // slippage: The maximum acceptable slippage of the buyAmount amount. 
  // slippage formula = slippage * 100
  // value 0.005 is %0.5, 0.05 is 5%, 0.01 is %1, 0.001 is %0.1 ...
  const slippage = 0.01; // %1
  const receiverAddress = starknet.selectedAddress;

  const approveCall:Call = await fibrous.buildApprove(
      inputAmount,
      tokenInAddress,
  );

  const swapCall = await fibrous.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage, 
    receiverAddress,
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
// slippage formula = slippage * 100
// value 0.005 is %0.5, 0.05 is 5%, 0.01 is %1, 0.001 is %0.1 ...
const slippage = 0.01; // %1
const swapCall = await fibrous.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage,
    receiverAddress,
);

const approveCall:Call = await fibrous.buildApprove(
      inputAmount,
      tokenInAddress,
  );

await account.execute([approveToken, swapCall])

```

Check out the [examples](./examples) folder for more detailed examples.

## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.


[def]: https://docs.fibrous.finance/
