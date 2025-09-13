# Fibrous SDK Examples

This directory contains examples demonstrating how to use the Fibrous Router SDK across different blockchain networks.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in this directory with the following variables:
   ```env
   # For Base network examples
   BASE_RPC_URL=your_base_rpc_url
   EVM_PUBLIC_KEY=your_evm_public_key
   EVM_PRIVATE_KEY=your_evm_private_key
   
   # For Scroll network examples
   SCROLL_RPC_URL=your_scroll_rpc_url
   
   # For Starknet examples
   STARKNET_RPC_URL=your_starknet_rpc_url
   STARKNET_PUBLIC_KEY=your_starknet_public_key
   STARKNET_PRIVATE_KEY=your_starknet_private_key
   ```

## Available Scripts

### Base Network Examples
- `npm run base:tokens` - List supported tokens on Base
- `npm run base:protocols` - List supported protocols on Base
- `npm run base:route` - Get route information for a swap on Base
- `npm run base:build` - Build and execute a transaction on Base

### Scroll Network Examples
- `npm run scroll:tokens` - List supported tokens on Scroll
- `npm run scroll:protocols` - List supported protocols on Scroll
- `npm run scroll:route` - Get route information for a swap on Scroll
- `npm run scroll:build` - Build and execute a transaction on Scroll

### Starknet Examples
- `npm run starknet:tokens` - List supported tokens on Starknet
- `npm run starknet:protocols` - List supported protocols on Starknet
- `npm run starknet:route` - Get route information for a swap on Starknet
- `npm run starknet:build` - Build and execute a transaction on Starknet
- `npm run starknet:batch` - Get batch route information on Starknet
- `npm run starknet:batch-build` - Build and execute batch transactions on Starknet

## Running from Root Directory

You can also run examples from the root directory using:

```bash
# Install example dependencies
npm run examples:install

# Run specific examples
npm run examples:base:tokens
npm run examples:base:build
npm run examples:starknet:route
# ... etc
```

## Network-Specific Directories

Each network has its own directory with the following files:

- `tokens.ts` - Lists all supported tokens
- `protocols.ts` - Lists all supported protocols  
- `route.ts` - Demonstrates route calculation
- `buildTransaction.ts` - Shows how to build and execute transactions
- `account.ts` - Helper for account setup
- `README.md` - Network-specific documentation

### Additional Starknet Files
- `batchRoute.ts` - Batch route calculation
- `buildBatchTransaction.ts` - Batch transaction building

## Utilities

- `utils/humanReadableLog.ts` - Helper for formatting transaction logs in a readable format

## Important Notes

1. Make sure you have sufficient funds in your wallets for transaction examples
2. Use testnet RPC URLs and accounts for testing
3. The `buildTransaction.ts` examples will actually execute transactions on the blockchain
4. Always verify transaction details before execution

## Troubleshooting

- If you get environment variable errors, make sure your `.env` file is properly configured
- For network connection issues, verify your RPC URLs are correct and accessible
- Check that you have the required dependencies installed with `npm install`
