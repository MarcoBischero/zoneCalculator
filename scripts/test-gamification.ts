
// scripts/test-gamification.ts
import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("🧪 Testing Gamification System...");

    // 1. Get a Test User
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("❌ No users found!");
        return;
    }
    console.log(`👤 Testing with user: ${user.username || user.email} (ID: ${user.id})`);

    // 2. Clear Profile to start fresh
    await prisma.gamificationProfile.deleteMany({ where: { userId: user.id } });

    // 3. Simulate API Call (Direct Logic test, since we can't fetch localhost easily in script if server is not running or different port, 
    // but better to fetch the real API if server is running. 
    // Actually, let's just use fetch if the server is running on 3000.

    const API_URL = "http://localhost:3000/api/gamification/track";

    try {
        console.log("👉 Sending MEAL_LOGGED action...");
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "MEAL_LOGGED", userId: user.id })
        });

        const text = await res.text();
        try {
            const data = JSON.parse(text);
            console.log("Response:", JSON.stringify(data, null, 2));

            if (!data.success) throw new Error(data.error);

            if (data.data.xp === 10) {
                console.log("✅ XP initialized correctly!");
            } else {
                console.error("❌ Stats incorrect!");
            }
        } catch (e) {
            console.error("❌ Failed to parse JSON. Raw response:");
            console.error(text.substring(0, 1000)); // Print first 1000 chars
            throw new Error("Invalid JSON response");
        }

        // 4. Test Streak Logic (Simulate next day?)
        // Hard to simulate time in E2E without mocking.
        // We will just verify the profile exists in DB.

        const profile = await prisma.gamificationProfile.findUnique({ where: { userId: user.id } });
        console.log("📊 DB Profile:", profile);

    } catch (e) {
        console.error("❌ API Test Failed (Server might be down or unreachable)", e);
    }
}

main();
