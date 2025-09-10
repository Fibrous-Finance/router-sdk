export type EXPLORER_MAP = {
    chain_name: string;
    explorer_url: string;
};

export const EXPLORER_MAP: EXPLORER_MAP[] = [
    {
        chain_name: "hyperevm",
        explorer_url: "https://hyperevmscan.io/tx/",
    },
    {
        chain_name: "base",
        explorer_url: "https://basescan.org/tx/",
    },
    {
        chain_name: "scroll",
        explorer_url: "https://scrollscan.com/tx/",
    },
    
];