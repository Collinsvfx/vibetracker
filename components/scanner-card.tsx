import { DexScreenerPair } from "@/types/dexscreener";
import { ArrowUpRight, ArrowDownRight, Bookmark, ShieldCheck, ShieldAlert, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ScannerCardProps {
    pair: DexScreenerPair;
    onBookmark: (pair: DexScreenerPair) => void;
    isBookmarked?: boolean;
}

export function ScannerCard({ pair, onBookmark, isBookmarked }: ScannerCardProps) {
    const isPositive = pair.priceChange.h1 >= 0;


    // --- SAFETY SCORE ALGORITHM ---
    let score = 0;
    const liquidity = pair.liquidity?.usd || 0;
    const volume = pair.volume.h24 || 0;
    const ageHours = pair.pairCreatedAt ? (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60) : 0;

    if (liquidity > 100000) score += 30;
    else if (liquidity > 10000) score += 15;

    if (volume > 100000) score += 20;
    else if (volume > 10000) score += 10;

    if (ageHours > 24) score += 20;
    else if (ageHours > 6) score += 10;

    // Boosts indicate community strength (or ad spend), usually a good sign for potential
    if (pair.boosts?.active && pair.boosts.active > 0) score += 10;

    // Cap at 100 (though logic above sums to 80 max without boosts, plenty of room)
    // We can add more checks later (e.g. fdv/liquidity ratio)

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
        <div className="glass-card rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-primary/50">


            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1">
                        {pair.chainId}
                        {pair.dexId === "pumpfun" && (
                            <span className="flex items-center gap-1 ml-1 bg-[#15803d] text-white border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-[0_0_10px_rgba(21,128,61,0.5)]">
                                💊 Pump.fun
                            </span>
                        )}
                        <span className={`flex items-center gap-1 ml-2 ${safetyColor} border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold`}>
                            <SafetyIcon size={10} /> {safetyLabel} ({score})
                        </span>
                    </span>
                    <Link href={`/token/${pair.baseToken.address}`} className="hover:underline">
                        <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2 mt-1">
                            {pair.baseToken.name}
                            <span className="text-sm text-gray-400 font-normal">({pair.baseToken.symbol})</span>
                        </h3>
                    </Link>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold font-mono">${parseFloat(pair.priceUsd).toFixed(6)}</div>
                    <div className={`flex items-center justify-end text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {pair.priceChange.h1}% (1h)
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400">Vol (1h)</div>
                    <div className="font-mono text-white">${pair.volume.h1.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400">Liq</div>
                    <div className="font-mono text-white">${pair.liquidity?.usd.toLocaleString()}</div>
                </div>
                {/* Age Badge */}
                <div className="bg-white/5 rounded-lg p-2 text-center col-span-2 flex justify-between px-4">
                    <span className="text-xs text-gray-400">Age</span>
                    <span className="font-mono text-white text-xs">
                        {ageHours < 1 ? "< 1h" : `${ageHours.toFixed(1)}h`}
                    </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center col-span-2 border border-white/10 mt-2">
                    <div className="flex items-center justify-center gap-1 text-gray-400 font-bold mb-1 text-xs">
                        <Sparkles size={10} className="text-purple-400" />
                        <span>Crystal Ball (24h)</span>
                    </div>
                    <div className="flex justify-between items-center px-4">
                        <p className="text-gray-500 text-[10px] leading-tight">
                            $10 &rarr;
                        </p>
                        <div className={`font-mono font-bold text-lg ${pair.priceChange.h24 >= 0 ? "text-green-400" : "text-red-400"}`}>
                            ${(10 * (1 + (pair.priceChange.h24 / 100))).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-3 flex gap-2">
                <a
                    href={pair.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/30 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                    DexScreener
                </a>
                {pair.chainId === "solana" && (
                    <a
                        href={`https://rugcheck.xyz/tokens/${pair.baseToken.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center"
                        title="Deep Scan on RugCheck"
                    >
                        <Shield size={20} />
                    </a>
                )}
                <button
                    onClick={() => onBookmark(pair)}
                    className={`px-3 py-2 rounded-lg border transition-colors flex items-center justify-center ${isBookmarked
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark this token"}
                >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
    );
}
