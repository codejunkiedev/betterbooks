import React, { Component, ReactNode } from 'react';
import { Button } from '@/shared/components/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/shared/utils/logger';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props & { navigate: (path: string) => void }, State> {
    constructor(props: Props & { navigate: (path: string) => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error using logger
        logger.error('ErrorBoundary caught an error', error, { errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false });
    };

    handleGoHome = () => {
        this.props.navigate('/');
        this.setState({ hasError: false });
    };

    override render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Something went wrong
                            </h2>

                            <p className="text-gray-600 mb-6">
                                We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                        Error Details (Development)
                                    </summary>
                                    <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto">
                                        <div className="mb-2">
                                            <strong>Error:</strong> {this.state.error.message}
                                        </div>
                                        {this.state.error.stack && (
                                            <div>
                                                <strong>Stack:</strong>
                                                <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={this.handleRetry}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>

                                <Button
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper component to provide navigation
export const ErrorBoundaryWrapper: React.FC<Props> = ({ children, fallback }) => {
    const navigate = useNavigate();
    return (
        <ErrorBoundary navigate={navigate} fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
}; 