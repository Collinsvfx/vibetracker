"use client";

import { useEffect, useState } from "react";
import { getTrendingTokensWithData } from "@/lib/dexscreener";
import { DexScreenerPair } from "@/types/dexscreener";
import { ScannerCard } from "@/components/scanner-card";
import { WatchlistSparkline } from "@/components/watchlist-sparkline"; // Import sparkline
import { VaultCard } from "@/components/vault-card"; // Import VaultCard
import { RefreshCcw, Shield, Trash2, ChevronDown, BadgeInfo } from "lucide-react"; // Import ChevronDown
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Import Supabase client

export default function Home() {
    const [allTokens, setAllTokens] = useState<DexScreenerPair[]>([]);
    const [displayedTokens, setDisplayedTokens] = useState<DexScreenerPair[]>([]);
    const [page, setPage] = useState(1);
    const TOKENS_PER_PAGE = 9;
    const [sortBy, setSortBy] = useState<string>("trending");

    const calculateScore = (pair: DexScreenerPair) => {
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

        if (pair.boosts?.active && pair.boosts.active > 0) score += 10;
        return score;
    };

    const handleSort = (criteria: string) => {
        setSortBy(criteria);
        setPage(1);

        let sorted = [...allTokens];
        switch (criteria) {
            case "gainers":
                sorted.sort((a, b) => b.priceChange.h1 - a.priceChange.h1);
                break;
            case "losers":
                sorted.sort((a, b) => a.priceChange.h1 - b.priceChange.h1);
                break;
            case "liquidity":
                sorted.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
                break;
            case "volume":
                sorted.sort((a, b) => (b.volume.h1 || 0) - (a.volume.h1 || 0));
                break;
            case "safest":
                sorted.sort((a, b) => calculateScore(b) - calculateScore(a));
                break;
            case "riskiest":
                sorted.sort((a, b) => calculateScore(a) - calculateScore(b));
                break;
            case "newest":
                sorted.sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0));
                break;
            case "oldest":
                sorted.sort((a, b) => (a.pairCreatedAt || 0) - (b.pairCreatedAt || 0));
                break;
            default:
                sorted.sort((a, b) => (b.txns.h1?.buys + b.txns.h1?.sells) - (a.txns.h1?.buys + a.txns.h1?.sells));
                break;
        }
        setAllTokens(sorted);
        setDisplayedTokens(sorted.slice(0, TOKENS_PER_PAGE));
    };

    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userChatId, setUserChatId] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for custom dropdown

    // Load Chat ID from local storage on mount
    useEffect(() => {
        const storedId = localStorage.getItem("vibetracker_chat_id");
        if (storedId) setUserChatId(storedId);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getTrendingTokensWithData();
            setAllTokens(data);
            setDisplayedTokens(data.slice(0, page * TOKENS_PER_PAGE));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        setDisplayedTokens(allTokens.slice(0, nextPage * TOKENS_PER_PAGE));
    };

    const fetchWatchlist = async () => {
        const { data } = await supabase.from("watchlist").select("*").order('created_at', { ascending: false });
        if (data) setWatchlist(data);
    };

    useEffect(() => {
        fetchData();
        fetchWatchlist();
        // Auto refresh every 60s
        const interval = setInterval(() => {
            fetchData();
            fetchWatchlist();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleBookmark = async (pair: DexScreenerPair) => {
        let targetId = userChatId;

        if (!targetId) {
            const id = prompt("Enter your Telegram Chat ID to receive alerts (saved for future):");
            if (id) {
                setUserChatId(id);
                localStorage.setItem("vibetracker_chat_id", id); // Save to local storage
                targetId = id;
            } else {
                return;
            }
        }

        try {
            const { error } = await supabase.from("watchlist").insert([
                {
                    contract_address: pair.baseToken.address,
                    symbol: pair.baseToken.symbol,
                    name: pair.baseToken.name,
                    network: pair.chainId,
                    initial_price: pair.priceUsd,
                    chat_id: targetId,
                }
            ]);

            if (error) {
                // If unique constraint error, likely already bookmarked
                if (error.code === '23505') {
                    alert("This token is already in your vault!");
                } else {
                    alert("Error: " + error.message);
                }
            } else {
                fetchWatchlist();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from("watchlist").delete().eq('id', id);
        if (!error) fetchWatchlist();
    };

    return (
        <main className="min-h-screen bg-black/90 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter neon-text bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            VIBE TRACKER
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Sentient Memecoin Intelligence & Background Sentinel
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh Scanner
                    </button>
                </header>

                {/* Vault Section */}
                {watchlist.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-primary" />
                            <h2 className="text-2xl font-bold">The Vault</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {watchlist.map((item) => (
                                <VaultCard key={item.id} item={item} onDelete={handleDelete} />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="w-2 h-8 bg-primary rounded-full block"></span>
                            Trending Feed
                        </h2>

                        <div className="flex items-center gap-4 relative">
                            {/* Custom Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium min-w-[180px] justify-between group"
                                >
                                    <span className="flex items-center gap-2">
                                        {sortBy === "trending" && "🔥 Trending"}
                                        {sortBy === "gainers" && "🚀 Top Gainers"}
                                        {sortBy === "losers" && "📉 Dip Buyers"}
                                        {sortBy === "liquidity" && "💧 High Liquidity"}
                                        {sortBy === "volume" && "📊 Highest Volume"}
                                        {sortBy === "safest" && "🛡️ Safest High Vibe"}
                                        {sortBy === "riskiest" && "🎲 Riskiest Degen"}
                                        {sortBy === "newest" && "🆕 Newest Launches"}
                                        {sortBy === "oldest" && "⏳ Oldest Pairs"}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-black/90 border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-1">
                                            {[
                                                { id: "trending", label: "🔥 Trending" },
                                                { id: "gainers", label: "🚀 Top Gainers (1h)" },
                                                { id: "losers", label: "📉 Dip Buyers (1h)" },
                                                { id: "liquidity", label: "💧 High Liquidity" },
                                                { id: "volume", label: "📊 Highest Volume" },
                                                { id: "safest", label: "🛡️ Safest (High Vibe)" },
                                                { id: "riskiest", label: "🎲 Riskiest (Degen)" },
                                                { id: "newest", label: "🆕 Newest Launches" },
                                                { id: "oldest", label: "⏳ Oldest Pairs" },
                                            ].map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => {
                                                        handleSort(option.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${sortBy === option.id
                                                        ? "bg-primary/20 text-primary border border-primary/20"
                                                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 text-sm text-gray-400 hidden md:flex">
                                <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-xs uppercase tracking-wider">Solana</span>
                                <span className="px-2 py-1 bg-white/5 rounded border border-white/10 text-xs uppercase tracking-wider">Base</span>
                            </div>
                        </div>
                    </div>

                    {loading && allTokens.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 rounded-xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedTokens.map((pair) => (
                                    <ScannerCard
                                        key={pair.pairAddress}
                                        pair={pair}
                                        onBookmark={handleBookmark}
                                    />
                                ))}
                            </div>

                            {displayedTokens.length < allTokens.length && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={loadMore}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                        Load More Gems 💎
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>


                <footer className="border-t border-white/10 pt-8 mt-12 text-center pb-8">
                    <p className="text-gray-500 text-sm mb-4">
                        VibeTracker &copy; 2024 • Sentient Memecoin Intelligence
                    </p>
                    <Link href="/guide" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-bold bg-primary/10 px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/20">
                        <BadgeInfo size={16} />
                        Read the "Sniper" Strategy Guide
                    </Link>
                </footer>
            </div >
        </main >
    );
}
