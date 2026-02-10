const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export async function sendTelegramMessage(chatId: number | string, text: string) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error("TELEGRAM_BOT_TOKEN is not set");
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown",
            }),
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("Failed to send Telegram message:", error);
        }
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}
