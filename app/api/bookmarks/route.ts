import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    const body = await request.json();
    const { contract_address, symbol, network, initial_price, chat_id, name } = body;

    if (!contract_address || !symbol) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("watchlist")
        .insert([
            { contract_address, symbol, network, initial_price, chat_id, name }
        ])
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
