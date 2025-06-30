export enum Strategy {
    SPOT = 1,
    CURVE = 2,
    BID_ASK = 3
}

export type EntryFunctionData = {
    function: `${string}::${string}::${string}`;
    typeArguments: string[];
    functionArguments: (string | number | string[])[];
}
type TokenFlags = "verified" | "native" | "meme";
export interface Token {
  address: string; // primary key
  name: string;
  symbol: string;
  decimals: number;
  coin_address: string | null;
  flags: TokenFlags[];
  iconUrl: string | null;
}

export type DlmmPool = {
    pool_addr: string; 
    user: string;
    token_0: string;
    token_0_data: Token;
    token_1: string;
    token_1_data: Token;
    fee_bps: bigint;
    bin_step_bps: bigint;
    active_id: bigint;
    protocol_fee_bps: bigint;
    ts: bigint;
}

export type DlmmPoolPair = {
    token_0: string;
    token_1: string;
    token_0_data: Token;
    token_1_data: Token;
    pools: DlmmPool[]
}