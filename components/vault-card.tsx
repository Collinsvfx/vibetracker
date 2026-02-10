"use client";

import { useEffect, useState } from "react";
import { getTokenPrice } from "@/lib/dexscreener"; // We might need to make this client-safe or call via API
import { WatchlistSparkline } from "./watchlist-sparkline";
import { Trash2, Calculator, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VaultCardProps {
    item: any;
    onDelete: (id: string) => void;
}

export function VaultCard({ item, onDelete }: VaultCardProps) {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceChange24h, setPriceChange24h] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [investment, setInvestment] = useState(100); // Default $100 investment assumption
    const [showCalc, setShowCalc] = useState(false);
    const [showCrystalBall, setShowCrystalBall] = useState(false);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // In a real app, we should batch these from the parent, but for this component demo we fetch individually
                const data = await getTokenPrice([item.contract_address]);
                if (data && data.pairs && data.pairs.length > 0) {
                    // Find pair with highest liquidity
                    const bestPair = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
                    setCurrentPrice(parseFloat(bestPair.priceUsd));
                    setPriceChange24h(bestPair.priceChange.h24 || 0);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPrice();
    }, [item.contract_address]);

    const entryPrice = parseFloat(item.initial_price);

    // Profit Logic
    // Tokens Owned = Investment / Entry Price
    // Gross Value = Tokens * Current Price
    // Gross Profit = Gross Value - Investment
    // Net Profit = Gross Profit - (Solana Fees + Swap Fees)

    const tokensOwned = investment / entryPrice;
    const grossValue = currentPrice ? tokensOwned * currentPrice : 0;
    const grossProfit = grossValue - investment;

    // Fees
    const solPriorityFee = 0.002; // ~$0.002 fixed
    const swapFeeValues = grossValue * 0.01; // 1% spread/fee assumption
    const netProfit = grossProfit - swapFeeValues - solPriorityFee;
    const roi = (netProfit / investment) * 100;

    const isProfit = netProfit >= 0;

    return (
        <div className="glass-card p-4 rounded-xl relative group transition-all hover:bg-white/5">
            <button
                onClick={() => onDelete(item.id)}
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <Trash2 size={16} />
            </button>

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg">{item.symbol}</h3>
                    <div className="text-xs font-mono text-gray-400">Entry: ${entryPrice.toFixed(6)}</div>
                    {currentPrice && (
                        <div className={`text-xs font-mono font-bold ${currentPrice > entryPrice ? "text-green-400" : "text-red-400"}`}>
                            Curr: ${currentPrice.toFixed(6)}
                        </div>
                    )}
                </div>

                {currentPrice && (
                    <div className="text-right">
                        <div className={`text-xl font-bold ${isProfit ? "text-green-400" : "text-red-400"}`}>
                            {roi.toFixed(2)}%
                        </div>
                        <div className="flex gap-2 justify-end mt-1">
                            <button
                                onClick={() => { setShowCalc(!showCalc); setShowCrystalBall(false); }}
                                className={`text-xs flex items-center gap-1 ${showCalc ? "text-white" : "text-gray-400"} hover:text-white transition-colors`}
                                title="Net Profit Calculator"
                            >
                                <Calculator size={12} />
                            </button>
                            <button
                                onClick={() => { setShowCrystalBall(!showCrystalBall); setShowCalc(false); }}
                                className={`text-xs flex items-center gap-1 ${showCrystalBall ? "text-purple-400" : "text-gray-400"} hover:text-purple-400 transition-colors`}
                                title="24h Crystal Ball"
                            >
                                <Sparkles size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCalc && (
                <div className="my-3 p-3 bg-black/40 rounded-lg border border-white/10 text-xs space-y-1 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between text-gray-400">
                        <span>Inv. Amount:</span>
                        <input
                            type="number"
                            value={investment}
                            onChange={(e) => setInvestment(parseFloat(e.target.value))}
                            className="w-16 bg-transparent border-b border-gray-600 text-right focus:outline-none text-white font-mono"
                        />
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Est. Fees (1% + Gas):</span>
                        <span className="font-mono text-red-400">-${(swapFeeValues + solPriorityFee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-white/10 pt-1 mt-1">
                        <span>Real Gain:</span>
                        <span className={isProfit ? "text-green-400" : "text-red-400"}>${netProfit.toFixed(2)}</span>
                    </div>
                </div>
            )}

            {showCrystalBall && (
                <div className="my-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30 text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 text-purple-300 font-bold mb-1">
                        <Sparkles size={12} />
                        <span>Crystal Ball (24h)</span>
                    </div>
                    <p className="text-gray-400 text-[10px] leading-tight mb-2">
                        If current momentum ({priceChange24h > 0 ? "+" : ""}{priceChange24h}%) continues for another 24h:
                    </p>
                    <div className="flex justify-between items-center bg-black/40 p-2 rounded">
                        <span className="text-gray-400">Projected Value:</span>
                        <span className={`font-mono font-bold text-lg ${priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                            ${(grossValue * (1 + (priceChange24h / 100))).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            <div className="h-12 mt-2">
                <WatchlistSparkline data={[
                    // Mock history relative to entry for now since we don't have full history API hooked up here yet
                    { time: '2024-01-01', value: entryPrice },
                    { time: '2024-01-02', value: entryPrice * (Math.random() * 0.2 + 0.9) },
                    { time: '2024-01-03', value: entryPrice * (Math.random() * 0.2 + 0.9) },
                    { time: '2024-01-04', value: currentPrice || entryPrice }
                ]} color={isProfit ? "#22c55e" : "#ef4444"} />
            </div>
        </div>
    );
}
