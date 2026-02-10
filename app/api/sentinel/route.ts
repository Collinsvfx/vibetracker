import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getTokenPrice } from "@/lib/dexscreener";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
    // 1. Fetch all bookmarks
    const { data: bookmarks, error } = await supabase
        .from("watchlist")
        .select("*");

    if (error || !bookmarks || bookmarks.length === 0) {
        return NextResponse.json({ message: "No bookmarks found or error fetching" }, { status: 200 });
    }

    // 2. Group by network to batch requests (DexScreener supports up to 30 addresses)
    // For simplicity, we just take all addresses since they are unique across chains in the API call usually,
    // but let's be safe and just pass the addresses.
    const addresses = bookmarks.map(b => b.contract_address);

    // Chunk into groups of 30 if needed, but for now assuming < 30
    const priceData = await getTokenPrice(addresses);

    if (!priceData || !priceData.pairs) {
        return NextResponse.json({ message: "Failed to fetch prices" }, { status: 500 });
    }

    const alertsSent = [];

    // 3. Check for price increases
    for (const bookmark of bookmarks) {
        const pair = priceData.pairs.find(p => p.baseToken.address === bookmark.contract_address);
        if (!pair) continue;

        const currentPrice = parseFloat(pair.priceUsd);
        const initialPrice = parseFloat(bookmark.initial_price);
        const threshold = parseFloat(bookmark.alert_threshold) || 5;

        if (!initialPrice) continue;

        const percentChange = ((currentPrice - initialPrice) / initialPrice) * 100;

        if (percentChange >= threshold) {
            // Check if we already alerted recently? (Optional optimization)

            const message = `🚀 *${bookmark.symbol}* is MOONING! \n\n` +
                `Price: $${currentPrice.toFixed(6)}\n` +
                `Change: +${percentChange.toFixed(2)}% since bookmark\n\n` +
                `[View Chart](${pair.url})`;

            if (bookmark.chat_id) {
                await sendTelegramMessage(bookmark.chat_id, message);
                alertsSent.push({ symbol: bookmark.symbol, change: percentChange });
            }
        }
    }

    return NextResponse.json({
        message: "Sentinel run complete",
        checked: bookmarks.length,
        alerts: alertsSent
    });
}
