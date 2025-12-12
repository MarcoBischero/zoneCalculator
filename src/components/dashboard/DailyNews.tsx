'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Loader2, BookOpen } from "lucide-react";
import Link from 'next/link';

export function DailyNews() {
    const [news, setNews] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage first to avoid re-generation on home click
        const cached = localStorage.getItem('daily_news_data_v2');
        const cachedTime = localStorage.getItem('daily_news_time_v2');
        const now = new Date().getTime();

        // Cache for 24 hours (or just session is fine, but 24h is better for "Daily" news)
        if (cached && cachedTime && (now - parseInt(cachedTime) < 1000 * 60 * 60 * 24)) {
            setNews(JSON.parse(cached));
            setLoading(false);
            return;
        }

        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                setNews(data);
                localStorage.setItem('daily_news_data_v2', JSON.stringify(data));
                localStorage.setItem('daily_news_time_v2', now.toString());
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <Card className="bg-white border-slate-100 shadow-sm">
            <CardContent className="p-4 flex items-center justify-center h-24">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400 mr-2" />
                <span className="text-slate-400 text-xs">Finding latest research...</span>
            </CardContent>
        </Card>
    );

    if (!news) return null;

    return (
        <Link href="/news/daily" className="block group">
            <Card className="bg-indigo-600 text-white border-none shadow-md overflow-hidden relative transition-all hover:shadow-xl hover:scale-[1.01]">
                <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
                    <Newspaper className="w-24 h-24 rotate-12" />
                </div>

                <CardContent className="p-5 flex items-start justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">Daily Read</span>
                            <span className="text-[10px] flex items-center gap-1"><BookOpen className="w-3 h-3" /> {news.readTime}</span>
                        </div>
                        <h3 className="text-lg font-bold leading-tight pr-4 group-hover:underline decoration-white/30 underline-offset-4 decoration-2">
                            {news.title}
                        </h3>
                        <p className="text-xs text-indigo-200 mt-1 line-clamp-1">{news.summary}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
