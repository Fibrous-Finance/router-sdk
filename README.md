<p align="center">
  <a href="https://fibrous.finance">
    <img src="./docs/assets/logo.png" width="400px" >
  </a>
</p>

# Fibrous Finance SDK (v0.6.3)

## Installation

```bash
# PNPM (recommended)
pnpm add fibrous-router-sdk

# NPM
npm install fibrous-router-sdk

# Yarn
yarn add fibrous-router-sdk
```

[Full Documentation](https://docs.fibrous.finance/)

## Migration Guides

### Migrating from v1 to v2 API

If you're upgrading to v2 API, please review our [Migration Guide: v1 → v2](./docs/MIGRATION_GUIDE.md) for detailed instructions. Key changes include:

- Use `apiVersion: "v2"` in Router constructor
- Call `refreshSupportedChains()` before using chain-related methods
- Update all method calls to use parameter objects
- Handle new error types (APIError, NetworkError, etc.)
- Automatic input validation

### Migrating from v0.5.x to v0.6.0

If you're upgrading from v0.5.x, please review our [Migration Guide](./docs/MIGRATION_GUIDE.md) for detailed instructions on updating your code. Key changes include:

- Replace `BigNumber` with native `bigint`
- Updated token interface properties
- Improved performance and smaller bundle size

## Usage

Check out the [Starknet examples](./examples/src/starknet/) and [Starknet README](./examples/src/starknet/README.md) for more detailed examples.

Check out the [Evm examples](./examples/src/evm/) and [Evm README](./examples/src/evm/README.md) for more detailed examples.


## Contributing

We welcome contributions from the community. Please review our [contributing guidelines](./docs/CONTRIBUTING.md) to get started.

[def]: https://docs.fibrous.finance/
