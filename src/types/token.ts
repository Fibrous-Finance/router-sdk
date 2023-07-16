export type Token = {
    // Name of the token
    name: string;

    // Symbol of the token
    symbol: string;

    // Decimal points of the token
    decimals: number;

    // Address of the token contract
    address: string;

    // If the token is base (DAI, USDC, ETH, WBTC etc.)
    isBase: boolean;

    // If the token is native (ETH on Ethereum)
    isNative: boolean;

    // Price in USD
    price: number;
};
