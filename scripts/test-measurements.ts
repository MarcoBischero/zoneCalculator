
// scripts/test-measurements.ts
import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("🧪 Testing Measurement API...");

    const user = await prisma.user.findFirst();
    if (!user) { console.error("No user"); return; }
    console.log(`User: ${user.id}`);

    const API_URL = "http://localhost:3000/api/user/measurements";

    try {
        // 1. POST
        console.log("👉 Logging Weight...");
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                weight: 75.5,
                bodyFat: 15.2
            })
        });
        console.log("POST Status:", res.status);
        const postData = await res.json();
        console.log("POST Response:", postData);

        // 2. GET
        console.log("👉 Fetching History...");
        const getRes = await fetch(`${API_URL}?userId=${user.id}`);
        const history = await getRes.json();
        console.log("History Length:", history.length);
        console.log("Last Entry:", history[history.length - 1]);

    } catch (e) {
        console.error(e);
    }
}

main();
