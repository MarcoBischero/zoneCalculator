'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { ChatInterface } from '@/components/coach/ChatInterface';
import { CoachSettingsGoalsForm } from '@/components/coach/CoachSettingsGoalsForm';
import { Button } from '@/components/ui/button';

export default function CoachPage() {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div>
            {/* Settings Toggle */}
            <div className="px-6 lg:px-10 pt-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="mb-4"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    {showSettings ? 'Hide' : 'Show'} Coach Settings & Goals
                </Button>

                {/* Collapsible Settings */}
                {showSettings && (
                    <div className="mb-6 animate-in slide-in-from-top">
                        <CoachSettingsGoalsForm />
                    </div>
                )}
            </div>

            {/* Chat Interface */}
            <ChatInterface />
        </div>
    );
}
