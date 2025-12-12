
// Basic dictionary of common foods with per 100g averages
export const commonFoods: Record<string, { p: number, c: number, f: number, type: string }> = {
    // Proteins
    'chicken breast': { p: 23, c: 0, f: 1, type: '1' },
    'petto di pollo': { p: 23, c: 0, f: 1, type: '1' },
    'pollo': { p: 23, c: 0, f: 1, type: '1' }, // Generic
    'turkey breast': { p: 24, c: 0, f: 1, type: '1' },
    'fesa di tacchino': { p: 24, c: 0, f: 1, type: '1' },
    'tacchino': { p: 24, c: 0, f: 1, type: '1' }, // Generic
    'salmon': { p: 20, c: 0, f: 13, type: '1' },
    'salmone': { p: 20, c: 0, f: 13, type: '1' },
    'manzo': { p: 20, c: 0, f: 5, type: '1' }, // Generic beef
    'egg': { p: 13, c: 1, f: 11, type: '1' },
    'eggs': { p: 13, c: 1, f: 11, type: '1' },
    'uovo': { p: 13, c: 1, f: 11, type: '1' },
    'uova': { p: 13, c: 1, f: 11, type: '1' },
    'egg white': { p: 11, c: 0, f: 0, type: '1' },
    'albume': { p: 11, c: 0, f: 0, type: '1' },
    'tuna': { p: 25, c: 0, f: 1, type: '1' },
    'tonno': { p: 25, c: 0, f: 1, type: '1' },
    'greek yogurt': { p: 10, c: 4, f: 0, type: '1' },
    'yogurt greco': { p: 10, c: 4, f: 0, type: '1' },
    'tofu': { p: 8, c: 2, f: 5, type: '1' },
    'bresaola': { p: 32, c: 0, f: 2, type: '1' },

    // Carbs
    'apple': { p: 0, c: 14, f: 0, type: '2' },
    'mela': { p: 0, c: 14, f: 0, type: '2' },
    'mele': { p: 0, c: 14, f: 0, type: '2' },
    'pear': { p: 0, c: 15, f: 0, type: '2' },
    'pera': { p: 0, c: 15, f: 0, type: '2' },
    'pere': { p: 0, c: 15, f: 0, type: '2' },
    'banana': { p: 1, c: 23, f: 0, type: '2' },
    'oats': { p: 17, c: 66, f: 7, type: '2' },
    'avena': { p: 17, c: 66, f: 7, type: '2' },
    'rice': { p: 7, c: 80, f: 1, type: '2' },
    'riso': { p: 7, c: 80, f: 1, type: '2' },
    'pasta': { p: 13, c: 70, f: 1, type: '2' },
    'bread': { p: 9, c: 49, f: 3, type: '2' },
    'pane': { p: 9, c: 49, f: 3, type: '2' },
    'broccoli': { p: 3, c: 7, f: 0, type: '2' },
    'spinach': { p: 3, c: 4, f: 0, type: '2' },
    'spinaci': { p: 3, c: 4, f: 0, type: '2' },
    'potato': { p: 2, c: 17, f: 0, type: '2' },
    'potatoes': { p: 2, c: 17, f: 0, type: '2' },
    'patata': { p: 2, c: 17, f: 0, type: '2' },
    'patate': { p: 2, c: 17, f: 0, type: '2' }, // Plural

    // Fats
    'olive oil': { p: 0, c: 0, f: 100, type: '3' },
    'olio': { p: 0, c: 0, f: 100, type: '3' },
    'almonds': { p: 21, c: 22, f: 50, type: '3' },
    'mandorle': { p: 21, c: 22, f: 50, type: '3' },
    'walnuts': { p: 15, c: 14, f: 65, type: '3' },
    'noci': { p: 15, c: 14, f: 65, type: '3' },
    'avocado': { p: 2, c: 9, f: 15, type: '3' },
    'peanut butter': { p: 25, c: 20, f: 50, type: '3' },
    'burro d\'arachidi': { p: 25, c: 20, f: 50, type: '3' },
};

export function estimateMacros(name: string) {
    const lower = name.toLowerCase();
    // 1. Exact match
    if (commonFoods[lower]) return commonFoods[lower];

    // 2. Partial match
    const found = Object.keys(commonFoods).find(k => lower.includes(k));
    if (found) return commonFoods[found];

    return null;
}
