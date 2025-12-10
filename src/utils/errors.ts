/**
 * Base error class for all SDK errors
 */
export class SDKError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error thrown when API request fails
 */
export class APIError extends SDKError {
    constructor(
        message: string,
        public readonly status: number,
        public readonly statusText?: string,
        public readonly response?: unknown,
    ) {
        super(message, "API_ERROR");
    }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends SDKError {
    constructor(message: string, public readonly originalError?: unknown) {
        super(message, "NETWORK_ERROR");
    }
}

/**
 * Error thrown when chain is not supported
 */
export class ChainNotSupportedError extends SDKError {
    constructor(chainNameOrId: string | number) {
        super(
            `Chain not supported: ${chainNameOrId}`,
            "CHAIN_NOT_SUPPORTED",
        );
    }
}

/**
 * Error thrown when token address is invalid
 */
export class InvalidTokenAddressError extends SDKError {
    constructor(address: string) {
        super(`Invalid token address: ${address}`, "INVALID_TOKEN_ADDRESS");
    }
}

/**
 * Error thrown when parameter validation fails
 */
export class InvalidParameterError extends SDKError {
    constructor(message: string, public readonly parameter?: string) {
        super(message, "INVALID_PARAMETER");
    }
}

/**
 * Error thrown when JSON parsing fails
 */
export class JSONParseError extends SDKError {
    constructor(message: string, public readonly originalError?: unknown) {
        super(message, "JSON_PARSE_ERROR");
    }
}

