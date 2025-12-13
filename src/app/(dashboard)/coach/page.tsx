import { Metadata } from 'next';
import { ChatInterface } from '@/components/coach/ChatInterface';

export const metadata: Metadata = {
    title: 'ZoneMentor | AI Coach',
    description: 'Il tuo nutrizionista personale AI',
};

export default function CoachPage() {
    return (
        <ChatInterface />
    );
}
