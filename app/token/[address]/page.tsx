"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTokenPrice } from "@/lib/dexscreener";
import { DexScreenerPair } from "@/types/dexscreener";
import { ArrowLeft, ExternalLink, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TokenDetail() {
    const params = useParams();
    const address = params.address as string;
    const [pair, setPair] = useState<DexScreenerPair | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;

        const fetchData = async () => {
            try {
                // We reuse the existing function which handles fetching by address
                // Even though it's named 'getTokenPrice', it returns the whole pair data
                const data = await getTokenPrice([address]);
                if (data && data.pairs && data.pairs.length > 0) {
                    // Find the best pair (highest liquidity)
                    const bestPair = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
                    setPair(bestPair);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [address]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black/90 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!pair) {
        return (
            <div className="min-h-screen bg-black/90 text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Token Not Found</h1>
                <Link href="/" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Back to Scanner
                </Link>
            </div>
        );
    }

    // --- SAFETY SCORE RE-CALC (Duplicated logic, ideally helper function) ---
    let score = 0;
    const liquidity = pair.liquidity?.usd || 0;
    const volume = pair.volume.h24 || 0;
    // We might not have pairCreatedAt in this specific response depending on endpoint 
    // but assuming we added it to type, valid to check. 
    // 'latest/dex/tokens' endpoint returns it.
    const ageHours = pair.pairCreatedAt ? (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60) : 0;

    if (liquidity > 100000) score += 30;
    else if (liquidity > 10000) score += 15;
    if (volume > 100000) score += 20;
    else if (volume > 10000) score += 10;
    if (ageHours > 24) score += 20;
    else if (ageHours > 6) score += 10;
    if (pair.boosts?.active && pair.boosts.active > 0) score += 10;

    let safetyLabel = "Degen Play";
    let safetyColor = "text-red-500";
    let SafetyIcon = ShieldAlert;

    if (score >= 60) {
        safetyLabel = "Safe-ish";
        safetyColor = "text-green-400";
        SafetyIcon = ShieldCheck;
    } else if (score >= 30) {
        safetyLabel = "Risky";
        safetyColor = "text-yellow-400";
        SafetyIcon = Shield;
    }

    return (
        <main className="min-h-screen bg-black/90 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {pair.baseToken.name}
                            <span className="text-muted-foreground text-xl">({pair.baseToken.symbol})</span>
                        </h1>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/40 ${safetyColor} font-bold`}>
                        <SafetyIcon size={18} />
                        {safetyLabel} ({score})
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">

                    {/* Left: Chart (Iframe) */}
                    <div className="lg:col-span-2 bg-black rounded-2xl border border-white/10 overflow-hidden relative">
                        <iframe
                            src={`https://dexscreener.com/${pair.chainId}/${pair.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            title="DexScreener Chart"
                        ></iframe>
                    </div>

                    {/* Right: Stats & Actions */}
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="glass-card p-6 rounded-2xl space-y-4">
                            <h2 className="text-xl font-bold mb-4">Token Metrics</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <div className="text-sm text-gray-400">Price USD</div>
                                    <div className="text-lg font-mono font-bold">${parseFloat(pair.priceUsd).toFixed(8)}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <div className="text-sm text-gray-400">Liquidity</div>
                                    <div className="text-lg font-mono font-bold text-blue-400">${pair.liquidity?.usd.toLocaleString()}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <div className="text-sm text-gray-400">FDV</div>
                                    <div className="text-lg font-mono font-bold">${pair.fdv?.toLocaleString() || "N/A"}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <div className="text-sm text-gray-400">Age</div>
                                    <div className="text-lg font-mono font-bold">{ageHours < 1 ? "< 1h" : `${ageHours.toFixed(1)}h`}</div>
                                </div>
                            </div>
                        </div>

                        {/* External Links */}
                        <div className="glass-card p-6 rounded-2xl">
                            <a
                                href={pair.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-all"
                            >
                                <ExternalLink size={18} />
                                View on DexScreener
                            </a>
                            {pair.chainId === "solana" && (
                                <a
                                    href={`https://rugcheck.xyz/tokens/${pair.baseToken.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-3 rounded-xl font-bold transition-all"
                                >
                                    <Shield size={18} />
                                    Deep Scan (RugCheck)
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
