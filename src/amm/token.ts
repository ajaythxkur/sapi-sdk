import { Token } from "../types/types";

export async function getTokens(baseUrl: string): Promise<{ source: string, data: Token[] } | undefined> {
    try {
        const res = await fetch(`${baseUrl}/v1/token/getAll`);
        const r = await res.json();
        return {
            ...r,
            data: r.data as Token[],
        }
    } catch (err) {
        console.log(`Error in getTokens: ${err}`)
        return undefined;
    }
}