'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, LogOut } from 'lucide-react';

export default function UserIndicator() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 z-50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.user.name || session.user.email}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Logged in
                    </span>
                </div>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Logout"
            >
                <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
        </div>
    );
}
