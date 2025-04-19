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
const chainName = "starknet";
const router = new FibrousRouter();
const tokens = await router.supportedTokens(chainName); // returns array as token type (src/types/token.ts)
```

Fetching route

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const router = new FibrousRouter();
const chainName = "starknet";

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

const tokens = await fibrous.supportedTokens(chainName);
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
const PUBLIC_KEY = process.env.STARKNET_PUBLIC_KEY;
const PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;
const RPC_URL = process.env.STARKNET_RPC_URL;
const DESTINATION = process.env.STARKNET_PUBLIC_KEY; // The address to receive the tokens after the swap is completed (required)

if (!DESTINATION || !PRIVATE_KEY || !RPC_URL || !PUBLIC_KEY) {
    throw new Error("Missing environment variables");
}

// https://www.starknetjs.com/docs/guides/connect_account
// If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter
const account0 = account(PRIVATE_KEY, PUBLIC_KEY, "1", RPC_URL);

// Call the buildTransaction method in order to build the transaction
// slippage: The maximum acceptable slippage of the buyAmount amount.
const slippage = 1; // %1
const swapCall = await fibrous.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage,
    DESTINATION,
    chainName
);

const approveCall:Call = await fibrous.buildApprove(
      inputAmount,
      tokenInAddress,
  );

await account.execute([approveCall, swapCall])

```

Build Batch transaction on Starknet

```javascript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { connect, disconnect } from '@argent/get-starknet'
import { Account, Provider } from "starknet";
import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "ethers";

const fibrous = new FibrousRouter();

const chainName = "starknet"

const tokens = await fibrous.supportedTokens(chainName);
const tokenInAddress_1 = tokens["eth"].address;
const tokenInAddress_2 = tokens["strk"].address;
const tokenInAddress_3 = tokens["usdc"].address;

const tokenOutAddress = tokens["usdt"].address;

const tokenInDecimals_1 = tokens["eth"].decimals;
const tokenInDecimals_2 = tokens["strk"].decimals;
const tokenInDecimals_3 = tokens["usdc"].decimals;

const inputAmounts = [
    BigNumber.from(1n * 10n ** BigInt(tokenInDecimals_1 - 3)), // 0.001 ETH
    BigNumber.from(10n * 10n ** BigInt(tokenInDecimals_2)), // 0.001 STRK
    BigNumber.from(5n * 10n ** BigInt(tokenInDecimals_3)), // 5 USDC
]; // 0.001 ETH


// Usage on your website

const starknet = await connect({ showList: false })

await starknet.enable()

if (starknet.isConnected) {

// Call the buildTransaction method in order to build the transaction
// slippage: The maximum acceptable slippage of the buyAmount amount.
const slippage = 1; // 1%
const destination = starknet.selectedAddress; // The address to receive the tokens after the swap is completed (required)

const tokenInAddresses = [tokenInAddress_1, tokenInAddress_2, tokenInAddress_3];
const tokenOutAddresses = [tokenOutAddress];
const swapCalls = await fibrous.buildBatchTransaction(
    inputAmounts,
    tokenInAddresses,
    tokenOutAddresses,
    slippage,
    destination,
    chainName,
);

   const approveCalls: Call[] = [];
    for(let i = 0; i < inputAmounts.length; i++) {
        const approveCall: Call = await fibrous.buildApproveStarknet(
            inputAmounts[i],
            tokenInAddresses[i],
        );
        approveCalls.push(approveCall);
    }
  await starknet.account.execute([...approveCall,...swapCall]);
}


// Usage on backend

const provider = new Provider();
const privateKey0 = "YOUR_PRIVATE_KEY";
const accountAddress0 = "YOUR_WALLET_ADDRESS";
// https://www.starknetjs.com/docs/guides/connect_account
// If this account is based on a Cairo v2 contract (for example OpenZeppelin account 0.7.0 or later), do not forget to add the parameter "1" after the privateKey parameter
const rpcUrl = "RPC_URL";
const account0 = account(privateKey, publicKey, "1", rpcUrl);

// Call the buildTransaction method in order to build the transaction
// slippage: The maximum acceptable slippage of the buyAmount amount.
const slippage = 1; // %1
const swapCalls = await fibrous.buildBatchTransaction(
    inputAmounts,
    tokenInAddresses,
    tokenOutAddresses,
    slippage,
    destination,
    chainName,
);

const approveCalls: Call[] = [];
for(let i = 0; i < inputAmounts.length; i++) {
    const approveCall: Call = await fibrous.buildApproveStarknet(
        inputAmounts[i],
        tokenInAddresses[i],
    );
    approveCalls.push(approveCall);
}

const resp = await account0.execute([...approveCalls, ...swapCalls]);
console.log(`https://voyager.online/tx/${resp.transaction_hash}`);
```

## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.

[def]: https://docs.fibrous.finance/
