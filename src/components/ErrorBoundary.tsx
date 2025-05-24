import React, { Component, ReactNode, ErrorInfo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ErrorBoundaryState } from '../types';

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * ErrorBoundary component implementing React error boundary pattern with TypeScript
 * Provides application-wide error handling to prevent complete application crashes
 * Displays user-friendly error messages while logging technical details for debugging
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Static lifecycle method to update state when error occurs
   * @param error - Error object caught by the boundary
   * @returns Updated state indicating error presence
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  /**
   * Lifecycle method called after error is caught
   * Logs error details and updates component state with error information
   * @param error - Error object containing error details
   * @param errorInfo - React error information including component stack
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging and monitoring purposes
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with comprehensive error information
    this.setState({
      error,
      errorInfo
    });

    // In production environment, this would interface with error monitoring services
    // Example implementation: errorReportingService.log({ error, errorInfo, timestamp: new Date() });
    
    // Optional: Send error metrics to analytics service
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      });
    }
  }

  /**
   * Reset error boundary state to attempt recovery
   * Provides users with opportunity to retry after error occurrence
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Reload entire application as fallback recovery mechanism
   * Ensures fresh application state when component-level recovery fails
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-container">
            <FontAwesomeIcon 
              icon={['fas', 'exclamation-triangle'] as IconProp} 
              className="error-icon" 
              size="3x"
              aria-hidden="true"
            />
            <h1 className="error-title">An Unexpected Error Occurred</h1>
            <p className="error-message">
              We apologize for the inconvenience. The application encountered an unexpected error 
              and was unable to complete your request. Contact Gabriel for assistance. 
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  <code>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </code>
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleReset}
                className="button button-primary"
                type="button"
              >
                <FontAwesomeIcon 
                  icon={['fas', 'redo'] as IconProp} 
                  className="button-icon" 
                />
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                className="button button-secondary"
                type="button"
              >
                <FontAwesomeIcon 
                  icon={['fas', 'sync'] as IconProp} 
                  className="button-icon" 
                />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Type augmentation for Google Analytics (if used in production)
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      parameters: { [key: string]: any }
    ) => void;
  }
}

export default ErrorBoundary;