
interface ZoneClassification {
    codTipo: string;  // '1'=Protein, '2'=Carbs, '3'=Fat, '4'=Mixed
    codFonte: string; // '1'=Best, '2'=Good, '3'=Poor
}

export function classifyFood(name: string, p: number, c: number, f: number): Partial<ZoneClassification> {
    const classification: Partial<ZoneClassification> = {};
    const lowerName = name.toLowerCase();

    // Keyword Dictionaries
    // Structure: { keywords: string[], type: string, source: string }
    const rules = [
        // PROTEINS - BEST (1)
        {
            type: '1', source: '1', keywords: [
                'pollo', 'chicken', 'tacchino', 'turkey', 'petto', 'breast',
                'manzo', 'beef', 'vitello', 'veal', 'magro', 'lean',
                'pesce', 'fish', 'tonno', 'tuna', 'salmone', 'salmon', 'merluzzo', 'cod', 'nasello', 'sogliola', 'accoiuga', 'alice', 'alici', 'gamber', 'shrimp',
                'uova', 'egg', 'albume',
                'tofu', 'seitan', 'soia', 'soy',
                'bresaola',
                'yogurt greco', 'greek yogurt'
            ]
        },
        // PROTEINS - POOR (3) - Processed/Fatty
        {
            type: '1', source: '3', keywords: [
                'salsiccia', 'sausage', 'salame', 'salami', 'pancetta', 'bacon',
                'mortadella', 'wurstel', 'hot dog', 'cotoletta', 'fritto', 'fried'
            ]
        },

        // CARBS - BEST (1) - Veg/Fruits
        {
            type: '2', source: '1', keywords: [
                'verdur', 'vegetab', 'insalata', 'salad', 'pomodor', 'tomato', 'zucchine', 'zucchini', 'melanzan', 'eggplant',
                'spinaci', 'spinach', 'broccol', 'cavol', 'cabbage', 'cetriol', 'cucumber', 'lattuga', 'lettuce',
                'mela', 'apple', 'pera', 'pear', 'arancia', 'orange', 'agrumi', 'citrus', 'kiwi', 'frutti di bosco', 'berries', 'fragol', 'strawberry', 'lampone', 'mirtill',
                'avena', 'oats', 'orzo', 'farro', 'quinoa'
            ]
        },
        // CARBS - GOOD (2) - Specific grains/starchy
        {
            type: '2', source: '2', keywords: [
                'riso', 'rice', 'basmati', 'integrale', 'brown',
                'pane', 'bread', 'segale', 'rye',
                'pasta', 'spaghetti',
                'mais', 'corn', 'cereali', 'cereal',
                'legumi', 'fagioli', 'beans', 'ceci', 'chickpeas', 'lenticchie', 'lentils'
            ]
        },
        // CARBS - POOR (3) - Sugars/Refined
        {
            type: '2', source: '3', keywords: [
                'zucchero', 'sugar', 'dolce', 'sweet', 'merendina', 'biscotti', 'cookies', 'torta', 'cake',
                'succo', 'juice', 'bevanda', 'soda', 'coca', 'fanta',
                'patat', 'potato', 'fritt', 'chips',
                'pizza', 'focaccia',
                'pane bianco', 'white bread'
            ]
        },

        // FATS - BEST (1)
        {
            type: '3', source: '1', keywords: [
                'olio', 'oil', 'extravergine', 'oliva', 'olive',
                'mandorl', 'almond', 'noci', 'walnut', 'nocciol', 'hazelnut', 'anacardi', 'cashew', 'pistacch', 'pistachio',
                'avocado', 'guacamole'
            ]
        },
        // FATS - POOR (3)
        {
            type: '3', source: '3', keywords: [
                'burro', 'butter', 'margarin', 'strutto', 'lardo', 'panna', 'cream'
            ]
        }
    ];

    // 1. Determine Type based on Macros (Dominant macro)
    if (p > 0 || c > 0 || f > 0) {
        if (p > c && p > f) {
            classification.codTipo = '1'; // Protein
        } else if (c > p && c > f) {
            classification.codTipo = '2'; // Carbs
        } else if (f > p && f > c) {
            classification.codTipo = '3'; // Fat
        } else {
            classification.codTipo = '4'; // Mixed
        }
    }

    // 2. Keyword Matching for Source AND Type fallback
    for (const rule of rules) {
        if (rule.keywords.some(k => lowerName.includes(k))) {
            // If Type not set (macros=0 or ambiguous), use keyword type
            if (!classification.codTipo) {
                classification.codTipo = rule.type;
            }

            // Set Source (prefer matching rule's source)
            // We iterate in order. It's better to find a match and break? 
            // Or let specific overrides happen?
            // The lists are fairly distinct.
            classification.codFonte = rule.source;
            break; // First match wins strategy
        }
    }

    // Fallback: Alcohol? (Carbs Poor)
    if (lowerName.includes('alcool') || lowerName.includes('alcohol') || lowerName.includes('vino') || lowerName.includes('wine') || lowerName.includes('birra')) {
        if (!classification.codTipo) classification.codTipo = '2';
        classification.codFonte = '3';
    }

    return classification;
}
