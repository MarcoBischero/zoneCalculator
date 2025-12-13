'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User, Clock, Share2, Printer, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

export default function DailyNewsPage() {
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = (forceRefresh = false) => {
        const stored = localStorage.getItem('daily_news_data_v2');
        if (stored && !forceRefresh) {
            setArticle(JSON.parse(stored));
        } else {
            setLoading(true);
            fetch('/api/news')
                .then(res => res.json())
                .then(data => {
                    setArticle(data);
                    localStorage.setItem('daily_news_data_v2', JSON.stringify(data));
                    localStorage.setItem('daily_news_time_v2', new Date().getTime().toString());
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    };

    const handleRefresh = () => {
        setArticle(null);
        loadNews(true);
    };

    if (!article && !loading) return (
        <div className="flex h-screen items-center justify-center">
            <Button onClick={() => loadNews(true)}>Load News</Button>
        </div>
    );

    if (loading) return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-500 animate-pulse">Scrivendo un nuovo articolo...</p>
        </div>
    );

    // Construct image URL safely
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(article.imagePrompt || 'healthy food abstract')}?nologo=true&width=1200&height=600`;

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Image */}
            <div className="relative h-[400px] w-full">
                <Image
                    src={imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Balanced overlay: dark enough for contrast, light enough to see image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/20" />
                {/* Additional dark box at bottom for text */}
                <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

                <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                    <Link href="/">
                        <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full shadow-lg backdrop-blur-sm">
                            <ChevronLeft className="w-5 h-5 mr-1" /> Dashboard
                        </Button>
                    </Link>

                    <Button
                        onClick={handleRefresh}
                        variant="ghost"
                        className="text-white hover:bg-white/20 hover:text-white rounded-full bg-black/30 backdrop-blur-sm shadow-lg"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Nuova News
                    </Button>
                </div>

                <div className="absolute bottom-0 w-full p-8 md:p-12 text-white">
                    <div className="max-w-4xl mx-auto">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-lg">
                            Science Daily
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            {article.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm md:text-base opacity-90 font-medium drop-shadow-lg">
                            <span className="flex items-center gap-2"><User className="w-4 h-4" /> {article.author}</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Oggi</span>
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {article.readTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <article className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-100">
                    <p className="text-xl text-slate-600 italic font-serif leading-relaxed">
                        {article.summary}
                    </p>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="rounded-full text-slate-500 hover:text-indigo-600">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* HTML Render - SECURITY: Sanitized with DOMPurify */}
                <div
                    className="prose prose-lg prose-indigo max-w-none text-slate-800 leading-8"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                />

                <div className="mt-16 p-8 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <h3 className="font-bold text-slate-900 mb-2">Ti è stato utile?</h3>
                    <p className="text-slate-500 mb-6">Metti in pratica la Zona nel tuo prossimo pasto.</p>
                    <Link href="/calculator">
                        <Button size="lg" className="bg-zone-blue-600 hover:bg-zone-blue-700 text-white font-bold rounded-full px-8">
                            Crea Pasto Ora
                        </Button>
                    </Link>
                </div>
            </article>
        </div>
    );
}
