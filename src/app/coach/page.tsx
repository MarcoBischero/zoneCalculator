import { Metadata } from 'next';
import { ChatInterface } from '@/components/coach/ChatInterface';

export const metadata: Metadata = {
    title: 'ZoneMentor | AI Coach',
    description: 'Il tuo nutrizionista personale AI',
};

export default function CoachPage() {
    return (
        <div className="container mx-auto py-8 px-4 h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">ZoneMentor <span className="text-emerald-400">AI</span></h1>
                <p className="text-gray-400">Il tuo coach personale, sempre attivo 24/7 per aiutarti a restare in Zona.</p>
            </div>

            <ChatInterface />
        </div>
    );
}
