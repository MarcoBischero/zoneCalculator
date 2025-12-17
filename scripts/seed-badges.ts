
import { prisma } from "../src/lib/prisma";

const BADGES = [
    {
        code: "EARLY_BIRD",
        name: "Early Bird",
        description: "Logga la colazione prima delle 8:00 per 5 giorni consecutivi.",
        icon: "🌅",
        category: "STREAK"
    },
    {
        code: "HYDRATION_HERO",
        name: "Hydration Hero",
        description: "Raggiungi il target di acqua per 7 giorni di fila.",
        icon: "💧",
        category: "HEALTH"
    },
    {
        code: "ZONE_MASTER",
        name: "Zone Master",
        description: "Mantieni un rapporto 40-30-30 perfetto per 3 pasti in un giorno.",
        icon: "🎯",
        category: "NUTRITION"
    },
    {
        code: "WEEKEND_WARRIOR",
        name: "Weekend Warrior",
        description: "Logga tutti i pasti di Sabato e Domenica.",
        icon: "🛡️",
        category: "STREAK"
    },
    {
        code: "SOCIAL_BEE",
        name: "Social Bee",
        description: "Condividi un pasto o una ricetta con un amico.",
        icon: "🐝",
        category: "SOCIAL"
    },
    {
        code: "NO_SUGAR",
        name: "Sugar Free",
        description: "Nessun pasto con 'Zuccheri aggiunti' per 5 giorni.",
        icon: "🍬",
        category: "NUTRITION"
    },
    {
        code: "GREEN_GIANT",
        name: "Green Giant",
        description: "Logga 5 porzioni di verdura in un giorno.",
        icon: "🥦",
        category: "NUTRITION"
    },
    {
        code: "STREAK_7",
        name: "Settimana di Fuoco",
        description: "Mantieni lo streak attivo per 7 giorni.",
        icon: "🔥",
        category: "STREAK"
    },
    {
        code: "STREAK_30",
        name: "Abitudine di Ferro",
        description: "Mantieni lo streak attivo per 30 giorni.",
        icon: "🗓️",
        category: "STREAK"
    },
    {
        code: "LEVEL_5",
        name: "Promessa della Zona",
        description: "Raggiungi il Livello 5.",
        icon: "⭐",
        category: "PROGRESSION"
    }
];

async function main() {
    console.log("🌱 Seeding Badges...");

    for (const badge of BADGES) {
        await prisma.badge.upsert({
            where: { code: badge.code },
            update: badge,
            create: badge,
        });
        console.log(`✅ Upserted badge: ${badge.name}`);
    }

    console.log("✨ Done!");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
