export enum Strategy {
    SPOT = 1,
    CURVE = 2,
    BID_ASK = 3
}

export type DlmmPool = { 
    assetA: string;
    assetB: string;
    poolAddr: string;
}