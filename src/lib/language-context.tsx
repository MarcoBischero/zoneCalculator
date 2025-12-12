'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';
import { useSession } from 'next-auth/react';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [language, setLanguage] = useState<Language>('it'); // Default IT

    // Fetch user preference on load
    useEffect(() => {
        if (session?.user) {
            // Priority 1: User DB setting (we need to fetch it as it might not be in session yet)
            fetch('/api/user')
                .then(res => res.json())
                .then(data => {
                    if (data.language && (data.language === 'it' || data.language === 'en')) {
                        setLanguage(data.language);
                    }
                })
                .catch(err => console.error("Failed to load language pref", err));
        } else {
            // Priority 2: Local Storage
            const saved = localStorage.getItem('zone-language') as Language;
            if (saved && (saved === 'it' || saved === 'en')) {
                setLanguage(saved);
            }
        }
    }, [session]);

    // Update LocalStorage when language changes
    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('zone-language', lang);
        // Note: The Settings page handles the DB update separately.
        // We could also do it here, but let's keep it simple for now.
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let current: any = translations[language];

        for (const k of keys) {
            if (current[k] === undefined) {
                console.warn(`Translation missing for key: ${key} in ${language}`);
                return key; // Fallback to key
            }
            current = current[k];
        }

        return typeof current === 'string' ? current : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
