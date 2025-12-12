const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // loads .env

async function main() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in process.env");
        return;
    }
    console.log("API Key found. Prefix:", key.substring(0, 4) + "...");

    // Call List Models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error("HTTP Error:", res.status, res.statusText);
            const text = await res.text();
            console.error("Response:", text);
            return;
        }
        const data = await res.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models found in response.");
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

main().finally(() => prisma.$disconnect());
