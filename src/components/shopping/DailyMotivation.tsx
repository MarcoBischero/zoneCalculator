import React, { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';

const MOTIVATIONS = [
    "Non è una dieta, è uno stile di vita.",
    "Il tuo corpo è l'unico posto dove devi vivere.",
    "Ogni pasto sano è un passo verso il tuo obiettivo.",
    "La disciplina è fare ciò che bisogna fare, anche se non se ne ha voglia.",
    "Sii la versione migliore di te stesso.",
    "Mangia bene per sentirti bene.",
    "La salute non è un traguardo, è un viaggio.",
    "Sei più forte delle tue scuse.",
    "Rispetta il tuo corpo, è l'unico che hai.",
    "Piccoli progressi ogni giorno portano a grandi risultati."
];

export function DailyMotivation() {
    const [quote, setQuote] = useState("");

    useEffect(() => {
        // Pick a random quote on mount
        const random = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
        setQuote(random);
    }, []);

    return (
        <div className="hidden print:flex flex-col items-center justify-center p-6 mb-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
            <Quote className="w-8 h-8 text-gray-400 mb-2 rotate-180" />
            <p className="text-xl font-serif italic text-gray-700 max-w-lg">
                "{quote}"
            </p>
            <div className="mt-4 text-xs uppercase tracking-widest text-gray-400 font-semibold">
                ZoneCalculator PRO • Shopping List
            </div>
        </div>
    );
}
