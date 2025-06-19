import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. This might be due to a network issue or a temporary problem.
            </p>
            
            <div className="space-y-3 mb-6">
              <button 
                onClick={this.handleReset} 
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload} 
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="mt-6 text-sm text-gray-500">
              <p>If the problem persists, please:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Check your internet connection</li>
                <li>• Ensure your wallet is connected</li>
                <li>• Try refreshing the page</li>
                <li>• Contact support if needed</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;