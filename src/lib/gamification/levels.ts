// Basic Leveling Logic
// Level = sqrt(XP / 100) + 1 roughly, or a fixed table.
// Let's use a simple quadratic curve: XP = (Level^2) * 100

export const LEVELS = {
    NOVICE_CAP: 5,
    PRACTITIONER_CAP: 20,
    EXPERT_CAP: 50,
};

/**
 * Calculates the level based on total XP.
 * Formula: Level = floor(sqrt(xp / 100)) + 1
 * Level 1: 0-99 XP
 * Level 2: 100-399 XP
 * Level 3: 400-899 XP
 * ...
 */
export function calculateLevel(xp: number): number {
    if (xp < 0) return 1;
    return Math.floor(Math.sqrt(xp / 50)) + 1; // Slightly faster progression (50 const)
}

/**
 * Calculates XP required to reach the NEXT level.
 */
export function xpForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 50;
}

/**
 * Get the Title for the current level
 */
export function getLevelTitle(level: number): string {
    if (level <= LEVELS.NOVICE_CAP) return "Novizio della Zona";
    if (level <= LEVELS.PRACTITIONER_CAP) return "Zoner Praticante";
    if (level <= LEVELS.EXPERT_CAP) return "Zoner Esperto";
    return "Maestro della Zona";
}
