import { AmountType } from "../types";
import { InvalidParameterError, InvalidTokenAddressError } from "./errors";

/**
 * Validates an Ethereum address format
 * @param address Address to validate
 * @param paramName Parameter name for error message
 * @throws InvalidTokenAddressError if address is invalid
 */
export function validateAddress(
    address: string,
    paramName: string = "address",
): void {
    if (!address || typeof address !== "string") {
        throw new InvalidTokenAddressError(
            `${paramName} must be a non-empty string`,
        );
    }

}

/**
 * Validates an amount value
 * @param amount Amount to validate
 * @param paramName Parameter name for error message
 * @throws InvalidParameterError if amount is invalid
 */
export function validateAmount(
    amount: AmountType,
    paramName: string = "amount",
): void {
    if (amount === null || amount === undefined) {
        throw new InvalidParameterError(
            `${paramName} cannot be null or undefined`,
            paramName,
        );
    }

    let numericValue: number;

    if (typeof amount === "bigint") {
        if (amount < 0n) {
            throw new InvalidParameterError(
                `${paramName} cannot be negative`,
                paramName,
            );
        }
        numericValue = Number(amount);
    } else if (typeof amount === "string") {
        const parsed = Number(amount);
        if (isNaN(parsed) || parsed < 0) {
            throw new InvalidParameterError(
                `${paramName} must be a valid non-negative number`,
                paramName,
            );
        }
        numericValue = parsed;
    } else if (typeof amount === "number") {
        if (isNaN(amount) || amount < 0 || !isFinite(amount)) {
            throw new InvalidParameterError(
                `${paramName} must be a valid non-negative finite number`,
                paramName,
            );
        }
        numericValue = amount;
    } else {
        // For BigNumberish from starknet, try to convert
        try {
            numericValue = Number(amount);
            if (isNaN(numericValue) || numericValue < 0) {
                throw new InvalidParameterError(
                    `${paramName} must be a valid non-negative number`,
                    paramName,
                );
            }
        } catch {
            throw new InvalidParameterError(
                `${paramName} must be a valid number, bigint, or string`,
                paramName,
            );
        }
    }

    if (numericValue === 0) {
        throw new InvalidParameterError(
            `${paramName} cannot be zero`,
            paramName,
        );
    }
}

/**
 * Validates slippage percentage
 * @param slippage Slippage percentage (1 = 1%)
 * @param paramName Parameter name for error message
 * @throws InvalidParameterError if slippage is invalid
 */
export function validateSlippage(
    slippage: number,
    paramName: string = "slippage",
): void {


    if (isNaN(slippage) || !isFinite(slippage)) {
        throw new InvalidParameterError(
            `${paramName} must be a valid finite number`,
            paramName,
        );
    }

    if (slippage < 0) {
        throw new InvalidParameterError(
            `${paramName} cannot be negative`,
            paramName,
        );
    }

    if (slippage > 100) {
        throw new InvalidParameterError(
            `${paramName} cannot exceed 100%`,
            paramName,
        );
    }
}

/**
 * Validates integration data
 * @param integrationData Integration data to validate
 * @throws InvalidParameterError if integration data is invalid
 */
export function validateIntegrationData(
    integrationData: {
        integratorAddress: string;
        integratorFeePercentageBps: number;
        integratorSurplusPercentageBps: number;
    },
): void {
    if (!integrationData) {
        throw new InvalidParameterError(
            "Integration data cannot be null or undefined",
        );
    }

    validateAddress(
        integrationData.integratorAddress,
        "integratorAddress",
    );

    if (
        typeof integrationData.integratorFeePercentageBps !== "number" ||
        isNaN(integrationData.integratorFeePercentageBps) ||
        !isFinite(integrationData.integratorFeePercentageBps)
    ) {
        throw new InvalidParameterError(
            "integratorFeePercentageBps must be a valid finite number",
            "integratorFeePercentageBps",
        );
    }

    if (
        integrationData.integratorFeePercentageBps < 0 ||
        integrationData.integratorFeePercentageBps > 500
    ) {
        throw new InvalidParameterError(
            "integratorFeePercentageBps must be between 0 and 500 (BPS)",
            "integratorFeePercentageBps",
        );
    }

    if (
        typeof integrationData.integratorSurplusPercentageBps !== "number" ||
        isNaN(integrationData.integratorSurplusPercentageBps) ||
        !isFinite(integrationData.integratorSurplusPercentageBps)
    ) {
        throw new InvalidParameterError(
            "integratorSurplusPercentageBps must be a valid finite number",
            "integratorSurplusPercentageBps",
        );
    }

    if (
        integrationData.integratorSurplusPercentageBps < 0 ||
        integrationData.integratorSurplusPercentageBps > 5000
    ) {
        throw new InvalidParameterError(
            "integratorSurplusPercentageBps must be between 0 and 500 (BPS)",
            "integratorSurplusPercentageBps",
        );
    }
}

/**
 * Validates batch transaction parameters
 * @param amounts Array of amounts
 * @param tokenInAddresses Array of input token addresses
 * @param tokenOutAddresses Array of output token addresses
 * @throws InvalidParameterError if arrays have mismatched lengths
 */
export function validateBatchParams(
    amounts: AmountType[],
    tokenInAddresses: string[],
    tokenOutAddresses: string[],
): void {
    if (!Array.isArray(amounts) || amounts.length === 0) {
        throw new InvalidParameterError(
            "amounts must be a non-empty array",
            "amounts",
        );
    }

    if (!Array.isArray(tokenInAddresses) || tokenInAddresses.length === 0) {
        throw new InvalidParameterError(
            "tokenInAddresses must be a non-empty array",
            "tokenInAddresses",
        );
    }

    if (!Array.isArray(tokenOutAddresses) || tokenOutAddresses.length === 0) {
        throw new InvalidParameterError(
            "tokenOutAddresses must be a non-empty array",
            "tokenOutAddresses",
        );
    }



    // Validate each amount
    amounts.forEach((amount, index) => {
        validateAmount(amount, `amounts[${index}]`);
    });

    // Validate each address
    tokenInAddresses.forEach((address, index) => {
        validateAddress(address, `tokenInAddresses[${index}]`);
    });

    tokenOutAddresses.forEach((address, index) => {
        validateAddress(address, `tokenOutAddresses[${index}]`);
    });
}

