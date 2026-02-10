"use client";

import Link from "next/link";
import { ArrowLeft, Shield, ShieldCheck, ShieldAlert, BadgeInfo } from "lucide-react";

export default function TradingGuide() {
    return (
        <main className="min-h-screen bg-black/90 text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-black neon-text bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                        Survival Guide 101
                    </h1>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-300 leading-relaxed">
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-green-500">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <ShieldCheck className="text-green-500" />
                            Rule #1: Survival First
                        </h2>
                        <p>
                            The goal is not to get rich overnight. The goal is to survive long enough to get lucky.
                            <strong> Never trade what you can't afford to burn.</strong>
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">How to Filter the Noise 🌪️</h2>
                        <ul className="space-y-3 list-disc pl-5">
                            <li>
                                <strong>Stick to Safe-ish:</strong> Only trade tokens with the <span className="text-green-400 font-bold">Green Badge</span>. Ignore the "Newest" feed until you are experienced.
                            </li>
                            <li>
                                <strong>Liquidity is King:</strong> Look for <strong>$50k+ Liquidity</strong>. Anything less is too easy to manipulate.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-blue-400" />
                            The Deep Scan (RugCheck)
                        </h2>
                        <p>Before you buy, click the <strong>Blue Shield</strong> button. If you see ANY of these, run away:</p>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                                <h3 className="font-bold text-red-400 mb-1">Mint Authority</h3>
                                <p className="text-xs">If "Enabled", the dev can print infinite coins.</p>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                                <h3 className="font-bold text-red-400 mb-1">LP Unlocked</h3>
                                <p className="text-xs">If "Unlocked", the dev can pull all the money out.</p>
                            </div>
                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                                <h3 className="font-bold text-red-400 mb-1">Top Holders</h3>
                                <p className="text-xs">If one wallet holds >20%, they own the price.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">The "Moon Bag" Strategy 💰</h2>
                        <ol className="list-decimal pl-5 space-y-3">
                            <li><strong>Entry:</strong> Buy small (5-10% of portfolio).</li>
                            <li><strong>Take Profit:</strong> If it does a <strong>2x (+100%)</strong>, sell <strong>50%</strong>.</li>
                            <li><strong>Result:</strong> Your initial money is back in your pocket. The rest is a "Moon Bag" — risk-free tokens that you can hold forever.</li>
                            <li><strong>Stop Loss:</strong> If it drops <strong>-20%</strong>, cut it loose. Don't pray for a bounce.</li>
                        </ol>
                    </section>

                    <div className="glass-card p-6 rounded-2xl bg-white/5 text-center mt-8">
                        <p className="italic text-gray-400">
                            "The market is a device for transferring money from the impatient to the patient."
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
