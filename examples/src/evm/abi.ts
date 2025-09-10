export const hyperContractAbi = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "acceptOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getSurplusHandler",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getSwapHandler",
        "inputs": [
            {
                "name": "protocol_id",
                "type": "int24",
                "internalType": "int24"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initialize",
        "inputs": [
            {
                "name": "_owner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pendingOwner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "removeSwapHandler",
        "inputs": [
            {
                "name": "protocol_id",
                "type": "int24",
                "internalType": "int24"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setSurplusHandler",
        "inputs": [
            {
                "name": "_surplusHandler",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setSwapHandler",
        "inputs": [
            {
                "name": "protocol_id",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "handler",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "surplusHandler",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "swap",
        "inputs": [
            {
                "name": "route",
                "type": "tuple",
                "internalType": "struct RouteParam",
                "components": [
                    {
                        "name": "token_in",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token_out",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amount_in",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amount_out",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "min_received",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "destination",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "swap_type",
                        "type": "uint8",
                        "internalType": "enum SwapType"
                    }
                ]
            },
            {
                "name": "swap_parameters",
                "type": "tuple[]",
                "internalType": "struct SwapParams[]",
                "components": [
                    {
                        "name": "token_in",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token_out",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "rate",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "protocol_id",
                        "type": "int24",
                        "internalType": "int24"
                    },
                    {
                        "name": "pool_address",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "swap_type",
                        "type": "uint8",
                        "internalType": "enum SwapType"
                    },
                    {
                        "name": "extra_data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "swapWithPermit",
        "inputs": [
            {
                "name": "route",
                "type": "tuple",
                "internalType": "struct RouteParam",
                "components": [
                    {
                        "name": "token_in",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token_out",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amount_in",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amount_out",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "min_received",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "destination",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "swap_type",
                        "type": "uint8",
                        "internalType": "enum SwapType"
                    }
                ]
            },
            {
                "name": "swap_parameters",
                "type": "tuple[]",
                "internalType": "struct SwapParams[]",
                "components": [
                    {
                        "name": "token_in",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token_out",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "rate",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "protocol_id",
                        "type": "int24",
                        "internalType": "int24"
                    },
                    {
                        "name": "pool_address",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "swap_type",
                        "type": "uint8",
                        "internalType": "enum SwapType"
                    },
                    {
                        "name": "extra_data",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "deadline",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "v",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "swappers",
        "inputs": [
            {
                "name": "",
                "type": "int24",
                "internalType": "int24"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "sweepMultipleStuckTokensOrEth",
        "inputs": [
            {
                "name": "tokens",
                "type": "address[]",
                "internalType": "address[]"
            },
            {
                "name": "amounts",
                "type": "uint256[]",
                "internalType": "uint256[]"
            },
            {
                "name": "receiver",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "sweepStuckTokensOrEth",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "receiver",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "AddHandler",
        "inputs": [
            {
                "name": "protocol_id",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            },
            {
                "name": "handler",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Initialized",
        "inputs": [
            {
                "name": "version",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferStarted",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SetNativeEthSupport",
        "inputs": [
            {
                "name": "protocol_id",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            },
            {
                "name": "support",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Swap",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount_in",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount_out",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "token_in",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "token_out",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "destination",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SwapHandlerRemoved",
        "inputs": [
            {
                "name": "protocol_id",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "AlreadySet",
        "inputs": []
    },
    {
        "type": "error",
        "name": "AmountInZero",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ArrayLengthsMismatching",
        "inputs": []
    },
    {
        "type": "error",
        "name": "CallFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "DestinationZero",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidAddress",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidInitialization",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MinReceivedAmountNotReached",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MinReceivedZero",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NoSwapsProvided",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotInitializing",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "SwapFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "TokenAddressesAreSame",
        "inputs": []
    },
    {
        "type": "error",
        "name": "WrongRoute",
        "inputs": []
    }
  ]