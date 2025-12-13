// Supermarket layout configurations for route optimization

export interface StoreSection {
    name: string;
    icon: string;
    order: number; // Walking order through store (1 = first section)
    keywords: string[]; // Keywords for AI matching
}

export interface Supermarket {
    id: string;
    name: string;
    logo?: string;
    sections: StoreSection[];
}

export const SUPERMARKETS: Supermarket[] = [
    {
        id: 'esselunga',
        name: 'Esselunga',
        sections: [
            {
                name: 'Ortofrutta',
                icon: '🥬',
                order: 1,
                keywords: ['verdure', 'frutta', 'insalata', 'pomodori', 'mele', 'banane', 'limoni', 'carote', 'zucchine', 'spinaci', 'broccoli', 'peperoni', 'cetrioli', 'fragole', 'arance']
            },
            {
                name: 'Panetteria',
                icon: '🍞',
                order: 2,
                keywords: ['pane', 'panini', 'focaccia', 'grissini', 'crackers', 'fette biscottate']
            },
            {
                name: 'Banco Carni',
                icon: '🥩',
                order: 3,
                keywords: ['pollo', 'tacchino', 'manzo', 'vitello', 'maiale', 'carne', 'fesa', 'petto', 'cosce', 'bistecca', 'arrosto']
            },
            {
                name: 'Banco Pesce',
                icon: '🐟',
                order: 4,
                keywords: ['pesce', 'salmone', 'tonno', 'orata', 'branzino', 'merluzzo', 'gamberi', 'calamari', 'cozze', 'vongole']
            },
            {
                name: 'Latticini e Formaggi',
                icon: '🧀',
                order: 5,
                keywords: ['latte', 'yogurt', 'formaggio', 'mozzarella', 'ricotta', 'parmigiano', 'grana', 'stracchino', 'burro', 'uova']
            },
            {
                name: 'Pasta e Riso',
                icon: '🍝',
                order: 6,
                keywords: ['pasta', 'spaghetti', 'penne', 'fusilli', 'riso', 'risotto', 'farro', 'orzo', 'cous cous', 'quinoa']
            },
            {
                name: 'Conserve e Scatolame',
                icon: '🥫',
                order: 7,
                keywords: ['tonno in scatola', 'pelati', 'legumi in scatola', 'fagioli', 'ceci', 'lenticchie', 'piselli', 'mais']
            },
            {
                name: 'Condimenti e Olio',
                icon: '🫒',
                order: 8,
                keywords: ['olio', 'aceto', 'sale', 'pepe', 'spezie', 'origano', 'basilico', 'salsa', 'maionese', 'ketchup']
            },
            {
                name: 'Frutta Secca e Semi',
                icon: '🥜',
                order: 9,
                keywords: ['noci', 'mandorle', 'nocciole', 'pistacchi', 'semi', 'arachidi', 'anacardi', 'uvetta', 'datteri']
            },
            {
                name: 'Bevande',
                icon: '🥤',
                order: 10,
                keywords: ['acqua', 'succhi', 'bibite', 'vino', 'birra', 'caffè', 'tè', 'tisane']
            },
            {
                name: 'Surgelati',
                icon: '🧊',
                order: 11,
                keywords: ['surgelati', 'gelato', 'verdure surgelate', 'pesce surgelato', 'pizza surgelata']
            },
            {
                name: 'Altro',
                icon: '🛒',
                order: 12,
                keywords: [] // Fallback for unmatched items
            }
        ]
    },
    {
        id: 'coop',
        name: 'Coop',
        sections: [
            {
                name: 'Ortofrutta',
                icon: '🥬',
                order: 1,
                keywords: ['verdure', 'frutta', 'insalata', 'pomodori', 'mele', 'banane', 'limoni', 'carote', 'zucchine', 'spinaci', 'broccoli', 'peperoni', 'cetrioli']
            },
            {
                name: 'Panetteria',
                icon: '🍞',
                order: 2,
                keywords: ['pane', 'panini', 'focaccia', 'grissini', 'crackers']
            },
            {
                name: 'Macelleria',
                icon: '🥩',
                order: 3,
                keywords: ['pollo', 'tacchino', 'manzo', 'vitello', 'maiale', 'carne', 'fesa', 'petto', 'bistecca']
            },
            {
                name: 'Pescheria',
                icon: '🐟',
                order: 4,
                keywords: ['pesce', 'salmone', 'tonno', 'orata', 'branzino', 'merluzzo', 'gamberi', 'calamari']
            },
            {
                name: 'Latticini',
                icon: '🧀',
                order: 5,
                keywords: ['latte', 'yogurt', 'formaggio', 'mozzarella', 'ricotta', 'parmigiano', 'burro', 'uova']
            },
            {
                name: 'Dispensa',
                icon: '🍝',
                order: 6,
                keywords: ['pasta', 'riso', 'tonno in scatola', 'pelati', 'legumi', 'fagioli', 'ceci', 'olio', 'aceto']
            },
            {
                name: 'Frutta Secca',
                icon: '🥜',
                order: 7,
                keywords: ['noci', 'mandorle', 'nocciole', 'semi', 'arachidi']
            },
            {
                name: 'Bevande',
                icon: '🥤',
                order: 8,
                keywords: ['acqua', 'succhi', 'bibite', 'vino', 'birra', 'caffè']
            },
            {
                name: 'Surgelati',
                icon: '🧊',
                order: 9,
                keywords: ['surgelati', 'gelato', 'verdure surgelate', 'pesce surgelato']
            },
            {
                name: 'Altro',
                icon: '🛒',
                order: 10,
                keywords: []
            }
        ]
    },
    {
        id: 'carrefour',
        name: 'Carrefour',
        sections: [
            {
                name: 'Frutta e Verdura',
                icon: '🥬',
                order: 1,
                keywords: ['verdure', 'frutta', 'insalata', 'pomodori', 'mele', 'banane', 'limoni', 'carote', 'zucchine']
            },
            {
                name: 'Bakery',
                icon: '🍞',
                order: 2,
                keywords: ['pane', 'panini', 'focaccia', 'grissini']
            },
            {
                name: 'Carni',
                icon: '🥩',
                order: 3,
                keywords: ['pollo', 'tacchino', 'manzo', 'maiale', 'carne', 'fesa', 'petto']
            },
            {
                name: 'Pesce',
                icon: '🐟',
                order: 4,
                keywords: ['pesce', 'salmone', 'tonno', 'orata', 'gamberi']
            },
            {
                name: 'Latticini',
                icon: '🧀',
                order: 5,
                keywords: ['latte', 'yogurt', 'formaggio', 'mozzarella', 'ricotta', 'uova']
            },
            {
                name: 'Drogheria',
                icon: '🍝',
                order: 6,
                keywords: ['pasta', 'riso', 'scatola', 'olio', 'aceto', 'legumi']
            },
            {
                name: 'Snack e Semi',
                icon: '🥜',
                order: 7,
                keywords: ['noci', 'mandorle', 'nocciole', 'semi']
            },
            {
                name: 'Bevande',
                icon: '🥤',
                order: 8,
                keywords: ['acqua', 'succhi', 'bibite', 'vino']
            },
            {
                name: 'Surgelati',
                icon: '🧊',
                order: 9,
                keywords: ['surgelati', 'gelato']
            },
            {
                name: 'Varie',
                icon: '🛒',
                order: 10,
                keywords: []
            }
        ]
    },
    {
        id: 'generic',
        name: 'Generico',
        sections: [
            {
                name: 'Frutta e Verdura',
                icon: '🥬',
                order: 1,
                keywords: ['verdure', 'frutta', 'insalata', 'pomodori', 'mele', 'banane']
            },
            {
                name: 'Pane',
                icon: '🍞',
                order: 2,
                keywords: ['pane', 'panini', 'grissini']
            },
            {
                name: 'Carne',
                icon: '🥩',
                order: 3,
                keywords: ['pollo', 'tacchino', 'manzo', 'carne']
            },
            {
                name: 'Pesce',
                icon: '🐟',
                order: 4,
                keywords: ['pesce', 'salmone', 'tonno']
            },
            {
                name: 'Latticini',
                icon: '🧀',
                order: 5,
                keywords: ['latte', 'yogurt', 'formaggio', 'uova']
            },
            {
                name: 'Dispensa',
                icon: '🍝',
                order: 6,
                keywords: ['pasta', 'riso', 'olio', 'scatola']
            },
            {
                name: 'Frutta Secca',
                icon: '🥜',
                order: 7,
                keywords: ['noci', 'mandorle', 'semi']
            },
            {
                name: 'Bevande',
                icon: '🥤',
                order: 8,
                keywords: ['acqua', 'succhi', 'bibite']
            },
            {
                name: 'Altro',
                icon: '🛒',
                order: 9,
                keywords: []
            }
        ]
    }
];

export function getSupermarketById(id: string): Supermarket | undefined {
    return SUPERMARKETS.find(s => s.id === id);
}

export function getDefaultSupermarket(): Supermarket {
    return SUPERMARKETS[0]; // Esselunga by default
}
