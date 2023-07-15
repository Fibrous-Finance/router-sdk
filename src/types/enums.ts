export const Protocol = {
  MySwap: 1,
  JediSwap: 2,
  TenKSwap: 3,
  SithSwap: 4,
} as const;

export type ProtocolId = typeof Protocol[keyof typeof Protocol];
