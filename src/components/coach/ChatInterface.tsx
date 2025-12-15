'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/language-context';
import { ProactiveSuggestions } from './ProactiveSuggestions';

const SUGGESTED_PROMPTS = [
    "Quanti blocchi mi rimangono oggi?",
    "Dammi un'idea per uno spuntino da 1 blocco",
    "Cos'è la Dieta a Zona?",
    "Ricetta veloce da 3 blocchi?"
];

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function ChatInterface() {
    const { t } = useLanguage();
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

    const handlePromptFromSuggestion = (message: string) => {
        setInput(message);
        // Automatically send the message
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
            }
        }, 100);
    };

    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in-up pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        {t('sidebar.coach') || 'ZoneMentor'}
                    </h1>
                    <p className="text-muted-foreground mt-2">Il tuo coach personale, sempre attivo 24/7 per aiutarti a restare in Zona.</p>
                </div>
            </div>

            {/* Proactive Suggestions */}
            <ProactiveSuggestions onAskAbout={handlePromptFromSuggestion} />

            {/* Chat Container */}
            <div className="border rounded-2xl overflow-hidden bg-card shadow-sm">

                {/* Messages Area */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="p-4 bg-muted/50 rounded-full mb-4">
                                <Bot className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Ciao! Sono il tuo ZoneMentor.</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                                Chiedimi consigli sui blocchi, ricette o supporto motivazionale. Conosco il tuo profilo e i tuoi pasti di oggi.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
                                {SUGGESTED_PROMPTS.map((prompt, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className="text-xs justify-start h-auto py-3"
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
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}

                            <div
                                className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm leading-relaxed ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                    }`}
                            >
                                {m.content}
                            </div>

                            {m.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-4 h-4 text-foreground" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-1.5 h-[38px]">
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-muted/30">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Chiedi al tuo coach..."
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
