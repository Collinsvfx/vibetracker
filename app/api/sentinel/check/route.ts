import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTokenPrice } from "@/lib/dexscreener";
import { sendTelegramMessage } from "@/lib/telegram";

// Prevent caching to ensure we get fresh data
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 1. Fetch all watchlist items
    const { data: watchlist, error } = await supabase
        .from("watchlist")
        .select("*");

    if (error || !watchlist || watchlist.length === 0) {
        return NextResponse.json({ message: "No items to check", error }, { status: 200 });
    }

    // 2. Group by address to batch DexScreener calls
    const distinctAddresses = Array.from(new Set(watchlist.map((item) => item.contract_address)));

    // DexScreener limit is 30 per call. Batch if needed?
    // For now assuming < 30 distinct tokens for MVP.
    // If > 30, we would loop. implementing simple batching just in case.

    const batches = [];
    while (distinctAddresses.length > 0) {
        batches.push(distinctAddresses.splice(0, 30));
    }

    let alertsSent = 0;
    const now = new Date();

    for (const batch of batches) {
        const priceData = await getTokenPrice(batch);
        if (!priceData || !priceData.pairs) continue;

        // Create a map of current prices for O(1) lookup
        const priceMap = new Map();
        priceData.pairs.forEach(pair => {
            // Use the pair with highest liquidity for price reference
            if (!priceMap.has(pair.baseToken.address) || pair.liquidity?.usd! > priceMap.get(pair.baseToken.address).liquidity?.usd!) {
                priceMap.set(pair.baseToken.address, pair);
            }
        });

        // 3. Check each watchlist item against current price
        for (const item of watchlist) {
            // Skip if no chat_id (can't alert)
            if (!item.chat_id) continue;

            const pair = priceMap.get(item.contract_address);
            if (!pair) continue;

            const currentPrice = parseFloat(pair.priceUsd);
            const entryPrice = parseFloat(item.initial_price);
            const thresholdPercent = item.alert_threshold || 50; // Default 50% if null

            if (!entryPrice) continue;

            // Calculate percentage change
            const percentChange = ((currentPrice - entryPrice) / entryPrice) * 100;

            console.log(`Checking ${item.symbol}: Entry ${entryPrice}, Curr ${currentPrice}, Change ${percentChange}%, Thresh ${thresholdPercent}%`);

            // Check if triggered
            if (percentChange >= thresholdPercent) {
                // Check cooldown (e.g., 1 hour)
                const lastAlert = item.last_alerted_at ? new Date(item.last_alerted_at) : null;
                const hoursSinceLast = lastAlert ? (now.getTime() - lastAlert.getTime()) / (1000 * 60 * 60) : 999;

                if (hoursSinceLast >= 1) { // 1 hour cooldown
                    // SEND ALERT
                    const emoji = percentChange > 100 ? "🚀🚀🚀" : "🚀";
                    const message = `
${emoji} *VIBE SENTINEL ALERT* ${emoji}

*${item.name} (${item.symbol})* is PUMPING!

💰 *Price:* $${currentPrice.toFixed(6)}
📈 *Gain:* +${percentChange.toFixed(2)}%
🎯 *Entry:* $${entryPrice.toFixed(6)}
💧 *Liq:* $${pair.liquidity?.usd.toLocaleString()}

[View on DexScreener](${pair.url})
                    `.trim();

                    await sendTelegramMessage(item.chat_id, message);
                    alertsSent++;

                    // Update last_alerted_at
                    await supabase
                        .from("watchlist")
                        .update({ last_alerted_at: now.toISOString() })
                        .eq("id", item.id);
                }
            }
        }
    }

    return NextResponse.json({
        message: "Sentinel run complete",
        alerts_sent: alertsSent,
        items_checked: watchlist.length
    });
}
