# Migration Guide: Fibrous Router SDK v0.5.x → v0.6.0

## Breaking Changes Alert

This is a **major release** with breaking changes. Please follow this guide to upgrade your integration.

## Quick Migration Summary

1. Replace `BigNumber.from()` with `BigInt()`
2. Remove `@ethersproject/bignumber` imports
3. Handle string decimals if accessing token properties directly
4. Update to v0.6.0: `npm install fibrous-router-sdk@0.6.0`

## Detailed Changes

### API Method Signatures

**Router Methods:**
```typescript
// Before (v0.5.x)
router.getBestRoute(amount: BigNumber, ...)
router.getBestRouteBatch(amounts: BigNumber[], ...)

// After (v0.6.0)
router.getBestRoute(amount: bigint, ...)
router.getBestRouteBatch(amounts: bigint[], ...)
```

### Token Interface Updates

```typescript
// Before (v0.5.x)
interface Token {
  decimals: number;
  price: number;
  isBase: boolean;
  isNative: boolean;
}

// After (v0.6.0)
interface Token {
  decimals: string;           // Changed: now string
  price: string | null;      // Changed: can be null
  base?: boolean | null;     // New: replaces isBase
  native?: boolean | null;   // New: replaces isNative
  image_url?: string;        // New: optional field
  verified?: boolean;        // New: optional field
  // Legacy fields still available
  isBase?: boolean;
  isNative?: boolean;
}
```

## Step-by-Step Migration

### Step 1: Update Package
```bash
npm install fibrous-router-sdk@0.6.0
```

### Step 2: Update Your Code

**Remove BigNumber imports:**
```typescript
// Remove this line
- import { BigNumber } from "@ethersproject/bignumber";
```

**Update amount handling:**
```typescript
// Before
const amount = BigNumber.from(parseUnits("100", 18));

// After
const amount = BigInt(parseUnits("100", 18));
```

**Update batch operations:**
```typescript
// Before
const amounts = [
  BigNumber.from(parseUnits("100", 18)),
  BigNumber.from(parseUnits("50", 6))
];

// After
const amounts = [
  BigInt(parseUnits("100", 18)),
  BigInt(parseUnits("50", 6))
];
```

**Handle token decimals:**
```typescript
// Before
const decimals = token.decimals; // was number

// After
const decimals = Number(token.decimals); // convert string to number
```

### Step 3: Test Your Integration
```typescript
import { Router as FibrousRouter } from "fibrous-router-sdk";
import { parseUnits } from "ethers";

const router = new FibrousRouter();
const tokens = await router.supportedTokens("base");
const ethToken = tokens.get("eth");
const usdcToken = tokens.get("usdc");

if (ethToken && usdcToken) {
  const amount = BigInt(parseUnits("1", Number(ethToken.decimals)));
  const route = await router.getBestRoute(
    amount,
    ethToken.address,
    usdcToken.address,
    "base"
  );
  console.log("Migration successful!", route);
}
```

## Package Manager Migration (Optional)

**Migrating to pnpm (recommended):**
```bash
# Remove old lock files
rm yarn.lock package-lock.json

# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install
```

**Staying with npm/yarn:**
No additional changes needed - just update the package version.

## Benefits of v0.6.0

- **50KB smaller bundle** - Removed @ethersproject/bignumber
- **Faster calculations** - Native bigint performance
- **Modern standards** - Aligned with current JavaScript features
- **Better types** - Enhanced TypeScript support
- **Future-proof** - Ready for upcoming features

## Troubleshooting

**"BigNumber is not defined"**
```typescript
// Remove BigNumber import and use BigInt instead
- import { BigNumber } from "@ethersproject/bignumber";
- const amount = BigNumber.from(value);
+ const amount = BigInt(value);
```

**Type errors with decimals**
```typescript
// Convert string decimals when needed
const decimals = Number(token.decimals);
```

**Batch operations not working**
```typescript
// Ensure all amounts are bigint
const amounts = inputAmounts.map(amt => BigInt(amt));
```

## Support

- **Examples**: Check `/examples` folder for updated code patterns
- **Tests**: Review `/tests/unit` for usage examples  
- **Issues**: Open a GitHub issue for specific problems
- **Community**: Join our Discord for support

---

This migration ensures your integration benefits from improved performance and modern JavaScript standards. 