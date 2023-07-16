export const Protocols = {
    mySwap: 1,
    JediSwap: 2,
    "10K Swap": 3,
    SithSwap: 4,
} as const;

export type ProtocolId = (typeof Protocols)[keyof typeof Protocols];
