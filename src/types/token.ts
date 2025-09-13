export type Token = {
    // Address of the token contract
    address: string;

    // Name of the token
    name: string;

    // Symbol of the token
    symbol: string;

    // Decimal points of the token (can be string from API)
    decimals: string;

    // Price in USD (can be null or string from API)
    price: string | null;

    // Image URL for the token icon
    image_url?: string;

    // Base token flag (can be null)
    base?: boolean | null;

    // Native token flag (can be null)
    native?: boolean | null;

    // Verification status
    verified?: boolean;

    // Token category
    category?: string | null;

    // Legacy fields for backward compatibility
    isBase?: boolean;
    isNative?: boolean;
};
