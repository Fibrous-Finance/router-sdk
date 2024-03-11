export const Protocols = {
    mySwap: 1,
    JediSwap: 2,
    TenKSwap: 3,
    SithSwap: 4,
    Ekubo: 5,
    MyswapCL: 6,
    StarkDefi: 7,
    JediSwapCL: 8,
    Nostra: 9,
    Haiko: 10,
} as const;

export type ProtocolId = (typeof Protocols)[keyof typeof Protocols];
