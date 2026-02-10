import { DexScreenerSearchResponse, TokenProfile } from "@/types/dexscreener";

const BASE_URL = "https://api.dexscreener.com";

export async function getTopBoostedTokens(): Promise<TokenProfile[]> {
    try {
        const res = await fetch(`${BASE_URL}/token-boosts/top/v1`);
        if (!res.ok) throw new Error("Failed to fetch top boosted tokens");
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTokenPrice(addresses: string[]): Promise<DexScreenerSearchResponse | null> {
    if (addresses.length === 0) return null;
    const addressString = addresses.join(",");
    try {
        const res = await fetch(`${BASE_URL}/latest/dex/tokens/${addressString}`);
        if (!res.ok) throw new Error("Failed to fetch token prices");
        return res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Since top-boosts only gives us profiles, we need to fetch the pair data to get price/volume
export async function getLatestTokenProfiles(): Promise<TokenProfile[]> {
    try {
        const res = await fetch(`${BASE_URL}/token-profiles/latest/v1`);
        if (!res.ok) throw new Error("Failed to fetch latest profiles");
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getTrendingTokensWithData() {
    // Fetch both boosts and latest profiles in parallel for maximum speed
    const [boosts, latest] = await Promise.all([
        getTopBoostedTokens(),
        getLatestTokenProfiles()
    ]);

    // Combine and deduplicate by token address immediately
    const combined = [...boosts, ...latest];

    // Filter for Solana and Base
    const relevantProfiles = combined.filter(
        (p) => p.chainId === "solana" || p.chainId === "base"
    );

    // Get unique addresses to prevent duplicate API calls
    const distinctAddresses = Array.from(new Set(relevantProfiles.map(p => p.tokenAddress)));

    // DexScreener allows up to 30 addresses per call, so we need to batch them
    // We'll take the top 90 to ensure we have enough data for a few "pages"
    const batches = [];
    const chunkSize = 30;
    for (let i = 0; i < Math.min(distinctAddresses.length, 90); i += chunkSize) {
        batches.push(distinctAddresses.slice(i, i + chunkSize));
    }

    const priceDataResults = await Promise.all(
        batches.map(batch => getTokenPrice(batch))
    );

    const allPairs: any[] = [];
    priceDataResults.forEach(data => {
        if (data && data.pairs) {
            allPairs.push(...data.pairs);
        }
    });

    // Deduplicate pairs effectively
    const uniquePairs = new Map();
    allPairs.forEach((pair) => {
        const existing = uniquePairs.get(pair.baseToken.address);
        // Keep the one with higher liquidity
        if (!existing || (pair.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
            uniquePairs.set(pair.baseToken.address, pair);
        }
    });

    // Sort by liquidity or some other metric to ensure garbage is at the bottom
    return Array.from(uniquePairs.values()).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
}
