import { DlmmPool, DlmmPoolPair, Token } from "../types/types";

export function groupPoolsByTokenPair(pools: DlmmPool[], tokens: Token[]): DlmmPoolPair[] {
    const map = new Map<string, DlmmPoolPair>();

    for (const pool of pools) {
        const key = `${pool.token_0}-${pool.token_1}`;
        const tokenA = tokens.find(t => t.address === pool.token_0);
        const tokenB = tokens.find(t => t.address === pool.token_1);
        if(!tokenA || !tokenB) continue; 
        if (!map.has(key)) {
            map.set(key, {
                token_0: pool.token_0,
                token_1: pool.token_1,
                token_0_data: tokenA,
                token_1_data: tokenB,
                pools: [],
            });
        }

        map.get(key)!.pools.push({ ...pool, token_0_data: tokenA, token_1_data: tokenB });
    }

    return Array.from(map.values());
}

export function getSinglePoolTokenData(pool: DlmmPool, tokens: Token[]): DlmmPool | undefined {
    const tokenA = tokens.find(t => t.address === pool.token_0);
    const tokenB = tokens.find(t => t.address === pool.token_1);
    if(tokenA && tokenB) {
        return { ...pool, token_0_data: tokenA, token_1_data: tokenB }
    }
}