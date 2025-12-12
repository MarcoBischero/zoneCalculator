'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Here you would send to your error monitoring service (Sentry, etc)
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-50/50 rounded-xl border border-slate-200 m-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-6 max-w-md">
                        We apologize for the inconvenience. An unexpected error occurred while processing your request.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            variant="outline"
                        >
                            Try Again
                        </Button>
                        <Button onClick={this.handleReload}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reload Page
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-slate-900 text-slate-200 rounded-lg text-left w-full overflow-auto max-h-64 text-xs font-mono">
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
