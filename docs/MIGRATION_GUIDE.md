# Migration Guide: Fibrous Router SDK v1 → v2

## Breaking Changes Alert

This guide covers migrating from **v1 API** to **v2 API**. The v2 API introduces parameter objects, improved error handling, and better type safety.

## Quick Migration Summary

1. Add `apiVersion: "v2"` to Router constructor
2. Call `refreshSupportedChains()` before using chain-related methods
3. Update all method calls to use parameter objects instead of individual parameters
4. Handle new error types (APIError, NetworkError, etc.)
5. Update to latest SDK version: `npm install fibrous-router-sdk@latest`

## Detailed Changes

### Router Initialization

**Before (v1):**
```typescript
const router = new FibrousRouter({
    apiKey: "your-api-key", // optional
});
```

**After (v2):**
```typescript
const router = new FibrousRouter({
    apiKey: "your-api-key", // optional
    apiVersion: "v2", // required for v2 API
});

// Always refresh chains first
const chains = await router.refreshSupportedChains();
```

### Method Signature Changes

All methods now use **parameter objects** instead of individual parameters for better type safety and consistency.

#### getBestRoute

**Before (v1):**
```typescript
const route = await router.getBestRoute(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    "hyperevm", // chainName
    {
        reverse: false,
    },
    chainId, // optional
);
```

**After (v2):**
```typescript
import { getBestRouteParams } from "fibrous-router-sdk";

const getBestRouteParams: getBestRouteParams = {
    amount: inputAmount,
    tokenInAddress: tokenInAddress,
    tokenOutAddress: tokenOutAddress,
    chainId: chainId, // preferred over chainName
    options: {
        reverse: false,
    },
};

const route = await router.getBestRoute(getBestRouteParams);
```

#### getBestRouteBatch

**Before (v1):**
```typescript
const routes = await router.getBestRouteBatch(
    amounts,
    tokenInAddresses,
    tokenOutAddresses,
    "hyperevm",
    integrationData,
    options,
);
```

**After (v2):**
```typescript
import { getBestRouteBatchParams } from "fibrous-router-sdk";

const getBestRouteBatchParams: getBestRouteBatchParams = {
    amounts: amounts,
    tokenInAddresses: tokenInAddresses,
    tokenOutAddresses: tokenOutAddresses,
    chainId: chainId,
    integrationData: integrationData,
    options: options,
};

const routes = await router.getBestRouteBatch(getBestRouteBatchParams);
```

#### buildRouteAndCalldata

**Before (v1):**
```typescript
const { route, calldata } = await router.buildRouteAndCalldata(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    1, // slippage
    destination,
    chainId,
    integrationData,
    options,
);
```

**After (v2):**
```typescript
import { buildRouteAndCalldataParams } from "fibrous-router-sdk";

const buildRouteAndCalldataParams: buildRouteAndCalldataParams = {
    inputAmount: inputAmount,
    tokenInAddress: tokenInAddress,
    tokenOutAddress: tokenOutAddress,
    slippage: 1,
    destination: destination,
    chainId: chainId,
    integrationData: integrationData, // optional
    options: options, // optional
};

const { route, calldata } = await router.buildRouteAndCalldata(buildRouteAndCalldataParams);
```

#### buildTransaction

**Before (v1):**
```typescript
const calldata = await router.buildTransaction(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    slippage,
    destination,
    chainName,
    integrationData,
    options,
    chainId,
);
```

**After (v2):**
```typescript
import { buildTransactionParams } from "fibrous-router-sdk";

const buildTransactionParams: buildTransactionParams = {
    inputAmount: inputAmount,
    tokenInAddress: tokenInAddress,
    tokenOutAddress: tokenOutAddress,
    slippage: slippage,
    destination: destination,
    chainId: chainId, // preferred over chainName
    integrationData: integrationData, // optional
    options: options, // optional
};

const calldata = await router.buildTransaction(buildTransactionParams);
```

#### buildBatchTransaction

**Before (v1):**
```typescript
const calls = await router.buildBatchTransaction(
    inputAmounts,
    tokenInAddresses,
    tokenOutAddresses,
    slippage,
    destination,
    chainName,
    integrationData,
    options,
    chainId,
);
```

**After (v2):**
```typescript
import { buildBatchTransactionParams } from "fibrous-router-sdk";

const buildBatchTransactionParams: buildBatchTransactionParams = {
    inputAmounts: inputAmounts,
    tokenInAddresses: tokenInAddresses,
    tokenOutAddresses: tokenOutAddresses,
    slippage: slippage,
    destination: destination,
    chainId: chainId, // preferred over chainName
    integrationData: integrationData, // optional
    options: options, // optional
};

const calls = await router.buildBatchTransaction(buildBatchTransactionParams);
```

### Error Handling

**Before (v1):**
```typescript
try {
    const route = await router.getBestRoute(...);
} catch (error) {
    // Generic error handling
    console.error(error);
}
```

**After (v2):**
```typescript
import { APIError, NetworkError, ChainNotSupportedError, InvalidParameterError } from "fibrous-router-sdk";

try {
    const route = await router.getBestRoute(params);
} catch (error) {
    if (error instanceof APIError) {
        // Handle API errors (4xx, 5xx)
        console.error(`API Error: ${error.status} - ${error.message}`);
    } else if (error instanceof NetworkError) {
        // Handle network errors
        console.error(`Network Error: ${error.message}`);
    } else if (error instanceof ChainNotSupportedError) {
        // Handle chain errors
        console.error(`Chain Error: ${error.message}`);
    } else if (error instanceof InvalidParameterError) {
        // Handle validation errors
        console.error(`Validation Error: ${error.message}`);
    } else {
        // Handle other errors
        console.error(`Unknown Error: ${error.message}`);
    }
}
```

### Input Validation

v2 API includes automatic input validation. Invalid inputs will throw `InvalidParameterError`:

```typescript
// These will throw InvalidParameterError:
- Negative amounts
- Zero amounts
- Invalid slippage values (< 0 or > 100)
- Invalid integration data (BPS values out of range)
```

### Integration Data

Integration data structure remains the same, but validation is stricter:

```typescript
const integrationData: IntegrationData = {
    integratorAddress: "0x...", // Must be valid Ethereum address
    integratorFeePercentageBps: 50, // Must be between 0 and 500
    integratorSurplusPercentageBps: 100, // Must be between 0 and 5000
};
```

### Chain ID vs Chain Name

**Recommendation:** Use `chainId` instead of `chainName` for better performance and consistency.

```typescript
// Preferred (v2)
const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
const params = {
    // ...
    chainId: chainId,
};

// Still supported but deprecated
const params = {
    // ...
    chainName: "hyperevm",
};
```

## Step-by-Step Migration

### Step 1: Update Package

```bash
npm install fibrous-router-sdk@latest
```

### Step 2: Update Router Initialization

```typescript
// Before
const router = new FibrousRouter({
    apiKey: process.env.API_KEY,
});

// After
const router = new FibrousRouter({
    apiKey: process.env.API_KEY,
    apiVersion: "v2",
});

// Add this
const chains = await router.refreshSupportedChains();
```

### Step 3: Update Method Calls

**Example: getBestRoute**

```typescript
// Before
const route = await router.getBestRoute(
    inputAmount,
    tokenInAddress,
    tokenOutAddress,
    "hyperevm",
    { reverse: false },
    chainId,
);

// After
import { getBestRouteParams } from "fibrous-router-sdk";

const params: getBestRouteParams = {
    amount: inputAmount,
    tokenInAddress: tokenInAddress,
    tokenOutAddress: tokenOutAddress,
    chainId: chainId,
    options: {
        reverse: false,
    },
};

const route = await router.getBestRoute(params);
```

### Step 4: Update Error Handling

```typescript
// Before
try {
    const route = await router.getBestRoute(...);
} catch (error) {
    console.error(error);
}

// After
import { APIError, NetworkError } from "fibrous-router-sdk";

try {
    const route = await router.getBestRoute(params);
} catch (error) {
    if (error instanceof APIError) {
        // Handle API errors
        console.error(`API Error: ${error.status}`);
    } else if (error instanceof NetworkError) {
        // Handle network errors
        console.error(`Network Error: ${error.message}`);
    } else {
        console.error(`Error: ${error.message}`);
    }
}
```

## Complete Migration Example

**Before (v1):**
```typescript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

const router = new FibrousRouter();
const chainId = router.supportedChains.find(chain => chain.chain_name == "hyperevm")?.chain_id;

const tokens = await router.supportedTokens(chainId);
const inputToken = tokens.get("usdc");
const outputToken = tokens.get("whype");

const inputAmount = BigInt(parseUnits("10", Number(inputToken.decimals)));

const route = await router.getBestRoute(
    inputAmount,
    inputToken.address,
    outputToken.address,
    "hyperevm",
    { reverse: false },
    chainId,
);
```

**After (v2):**
```typescript
import { Router as FibrousRouter, getBestRouteParams } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

const router = new FibrousRouter({
    apiVersion: "v2",
});

const chains = await router.refreshSupportedChains();
const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;

if (!chainId) {
    throw new Error("Chain not supported");
}

const tokens = await router.supportedTokens(chainId);
const inputToken = tokens.get("usdc");
const outputToken = tokens.get("whype");

if (!inputToken || !outputToken) {
    throw new Error("Tokens not found");
}

const inputAmount = BigInt(parseUnits("10", Number(inputToken.decimals)));

const params: getBestRouteParams = {
    amount: inputAmount,
    tokenInAddress: inputToken.address,
    tokenOutAddress: outputToken.address,
    chainId: chainId,
    options: {
        reverse: false,
    },
};

const route = await router.getBestRoute(params);
```

## Benefits of v2 API

- **Better Type Safety** - Parameter objects provide better IDE autocomplete and type checking
- **Improved Error Handling** - Custom error classes for better error handling
- **Input Validation** - Automatic validation of inputs before API calls
- **Consistency** - All methods follow the same pattern
- **Future-proof** - Easier to add new parameters without breaking changes

## Troubleshooting

**"Chain not supported" error**
```typescript
// Make sure to call refreshSupportedChains() first
const chains = await router.refreshSupportedChains();
const chainId = chains.find(chain => chain.chain_name == "hyperevm")?.chain_id;
```

**"InvalidParameterError" errors**
```typescript
// Check your input values:
- Amounts must be positive and non-zero
- Slippage must be between 0 and 100
- Integration data BPS values must be in valid ranges
```

**Type errors with parameter objects**
```typescript
// Import the parameter types
import { getBestRouteParams, buildRouteAndCalldataParams } from "fibrous-router-sdk";

// Use the types
const params: getBestRouteParams = { ... };
```

**API version not specified**
```typescript
// Always specify apiVersion in constructor
const router = new FibrousRouter({
    apiVersion: "v2",
});
```

## Support

- **Examples**: Check `/examples/src/evm/v2` and `/examples/src/starknet/v2` for v2 usage examples
- **Tests**: Review `/tests/unit` for usage examples
- **Issues**: Open a GitHub issue for specific problems
- **Community**: Join our Discord for support

---

This migration ensures your integration benefits from improved type safety, better error handling, and automatic input validation.
