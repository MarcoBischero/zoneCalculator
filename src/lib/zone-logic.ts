export interface Ingredient {
    name: string;
    grams: number;
    macros: {
        p: number; // protein per 100g
        c: number; // carbs per 100g
        f: number; // fat per 100g
    };
}

export function calculateMealBlocks(ingredients: Ingredient[]) {
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    ingredients.forEach(i => {
        const ratio = i.grams / 100;
        totalP += i.macros.p * ratio;
        totalC += i.macros.c * ratio;
        totalF += i.macros.f * ratio;
    });

    return {
        blocksP: totalP / 7,
        blocksC: totalC / 9,
        blocksF: totalF / 1.5, // Standard zone fat calculation (can be 3g if unbalanced)
        gramsP: totalP,
        gramsC: totalC,
        gramsF: totalF,
        ratio: totalC > 0 ? totalP / totalC : 0
    };
}

export function autoBalanceMeal(ingredients: Ingredient[], targetBlocks: number): Ingredient[] {
    const adjustedIngredients = JSON.parse(JSON.stringify(ingredients));

    // 1. Identify primary sources
    let primaryP = { index: -1, amount: 0 };
    let primaryC = { index: -1, amount: 0 };
    let primaryF = { index: -1, amount: 0 };

    adjustedIngredients.forEach((ing: Ingredient, idx: number) => {
        if (ing.macros.p > 10 && ing.macros.p > ing.macros.c) {
            if (ing.macros.p > primaryP.amount) primaryP = { index: idx, amount: ing.macros.p };
        }
        if (ing.macros.c > 10 && ing.macros.c > ing.macros.p) {
            if (ing.macros.c > primaryC.amount) primaryC = { index: idx, amount: ing.macros.c };
        }
        if (ing.macros.f > 10) {
            if (ing.macros.f > primaryF.amount) primaryF = { index: idx, amount: ing.macros.f };
        }
    });

    // 2. Adjust Protein
    if (primaryP.index !== -1) {
        const stats = calculateMealBlocks(adjustedIngredients);
        if (Math.abs(stats.blocksP - targetBlocks) > 0.2) {
            const currentP = stats.gramsP;
            const targetP = targetBlocks * 7;
            const diffP = targetP - currentP;
            const pPerGram = adjustedIngredients[primaryP.index].macros.p / 100;
            // Add/Subtract grams needed
            const gramsNeeded = diffP / pPerGram;
            adjustedIngredients[primaryP.index].grams = Math.max(10, Math.round(adjustedIngredients[primaryP.index].grams + gramsNeeded));
        }
    }

    // 3. Adjust Carbs
    if (primaryC.index !== -1) {
        const stats = calculateMealBlocks(adjustedIngredients);
        if (Math.abs(stats.blocksC - targetBlocks) > 0.2) {
            const currentC = stats.gramsC;
            const targetC = targetBlocks * 9;
            const diffC = targetC - currentC;
            const cPerGram = adjustedIngredients[primaryC.index].macros.c / 100;
            const gramsNeeded = diffC / cPerGram;
            adjustedIngredients[primaryC.index].grams = Math.max(10, Math.round(adjustedIngredients[primaryC.index].grams + gramsNeeded));
        }
    }

    // 4. Adjust Fat (Optional, less critical for ratio but good for blocks)
    if (primaryF.index !== -1) {
        const stats = calculateMealBlocks(adjustedIngredients);
        if (Math.abs(stats.blocksF - targetBlocks) > 0.2) {
            const currentF = stats.gramsF;
            const targetF = targetBlocks * 1.5; // Using 1.5 as base
            const diffF = targetF - currentF;
            const fPerGram = adjustedIngredients[primaryF.index].macros.f / 100;
            const gramsNeeded = diffF / fPerGram;
            adjustedIngredients[primaryF.index].grams = Math.max(5, Math.round(adjustedIngredients[primaryF.index].grams + gramsNeeded));
        }
    }

    return adjustedIngredients;
}
