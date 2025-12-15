'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Suggestion {
    id: number;
    type: string;
    message: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    createdAt: string;
}

interface ProactiveSuggestionsProps {
    onAskAbout?: (message: string) => void;
}

export function ProactiveSuggestions({ onAskAbout }: ProactiveSuggestionsProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const response = await fetch('/api/coach/suggestions');
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);

                // If no suggestions, try to generate them
                if (data.length === 0) {
                    await generateSuggestions();
                }
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/coach/suggestions', {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.generated && data.suggestions) {
                    setSuggestions(data.suggestions);
                }
            }
        } catch (error) {
            console.error('Error generating suggestions:', error);
        } finally {
            setGenerating(false);
        }
    };

    const dismissSuggestion = async (id: number) => {
        try {
            await fetch('/api/coach/suggestions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'dismiss' })
            });

            setSuggestions(suggestions.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error dismissing suggestion:', error);
        }
    };

    const handleAskAbout = async (suggestion: Suggestion) => {
        // Mark as read
        try {
            await fetch('/api/coach/suggestions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: suggestion.id, action: 'read' })
            });
        } catch (error) {
            console.error('Error marking suggestion as read:', error);
        }

        // Pre-fill chat with question
        if (onAskAbout) {
            onAskAbout(suggestion.message);
        }

        // Remove from list
        setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400';
            case 'MEDIUM':
                return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400';
            case 'LOW':
                return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400';
            default:
                return 'bg-muted';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return '🔴';
            case 'MEDIUM':
                return '🟡';
            case 'LOW':
                return '🔵';
            default:
                return '⚪';
        }
    };

    if (loading) {
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Proactive Coaching</h3>
                </div>
                <div className="text-sm text-muted-foreground animate-pulse">
                    Loading suggestions...
                </div>
            </div>
        );
    }

    if (generating) {
        return (
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary animate-spin" />
                    <h3 className="font-semibold">Analyzing your day...</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                    Generating personalized suggestions
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null; // No suggestions, no display
    }

    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Proactive Coaching</h3>
                <span className="text-xs text-muted-foreground">
                    ({suggestions.length} tip{suggestions.length > 1 ? 's' : ''})
                </span>
            </div>

            <div className="space-y-2">
                {suggestions.map((suggestion) => (
                    <Card
                        key={suggestion.id}
                        className={`p-4 border ${getPriorityColor(suggestion.priority)}`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-lg flex-shrink-0 mt-0.5">
                                {getPriorityIcon(suggestion.priority)}
                            </span>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-relaxed">
                                    {suggestion.message}
                                </p>
                            </div>

                            <div className="flex gap-1 flex-shrink-0">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAskAbout(suggestion)}
                                    title="Ask ZoneMentor about this"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => dismissSuggestion(suggestion.id)}
                                    title="Dismiss"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
