'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const SUGGESTED_PROMPTS = [
    "Quanti blocchi mi rimangono oggi?",
    "Dammi un'idea per uno spuntino da 1 blocco",
    "Cos'è la Dieta a Zona?",
    "Sono pigro stasera, ricetta veloce da 3 blocchi?"
];

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput('');
        const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!response.ok) throw new Error('API Error');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    aiResponse += decoder.decode(value, { stream: true });
                }
            }

            setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, { role: 'assistant', content: 'Mi dispiace, si è verificato un errore.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col border-none shadow-2xl bg-black/40 backdrop-blur-xl ring-1 ring-white/10">
            <CardHeader className="border-b border-white/10 bg-black/20">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                    ZoneMentor AI
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 pb-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                                <Bot className="w-16 h-16 mb-4 text-emerald-400/50" />
                                <h3 className="text-lg font-semibold text-white">Ciao! Sono il tuo ZoneMentor.</h3>
                                <p className="text-sm text-gray-400 max-w-sm mt-2">
                                    Chiedimi consigli sui blocchi, ricette o supporto motivazionale. Conosco il tuo profilo e i tuoi pasti di oggi.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8 w-full max-w-lg">
                                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="text-xs justify-start h-auto py-3 bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-300"
                                            onClick={() => handlePromptClick(prompt)}
                                        >
                                            {prompt}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {m.role !== 'user' && (
                                    <Avatar className="w-8 h-8 border border-emerald-500/50 bg-emerald-900/20">
                                        <AvatarFallback><Bot className="w-4 h-4 text-emerald-400" /></AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm leading-relaxed ${m.role === 'user'
                                            ? 'bg-emerald-600/80 text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                                        }`}
                                >
                                    {m.content}
                                </div>

                                {m.role === 'user' && (
                                    <Avatar className="w-8 h-8 border border-white/20 bg-white/5">
                                        <AvatarFallback><User className="w-4 h-4 text-white" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start gap-3">
                                <Avatar className="w-8 h-8 border border-emerald-500/50 bg-emerald-900/20">
                                    <AvatarFallback><Bot className="w-4 h-4 text-emerald-400" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-white/5 rounded-2xl px-4 py-2 rounded-tl-none border border-white/5 flex items-center gap-1.5 h-[38px]">
                                    <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 bg-black/20 border-t border-white/10">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Chiedi al tuo coach..."
                            className="bg-black/40 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
