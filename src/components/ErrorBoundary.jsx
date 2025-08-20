import React from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Error Boundary component to catch JavaScript errors in the component tree
 * Displays a fallback UI when an error occurs instead of crashing the entire app
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Reset the error boundary state and reload the page
    window.location.reload();
  };

  handleReset = () => {
    // Reset the error boundary state without reloading
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            <p className={styles.errorMessage}>
              The application encountered an unexpected error. This usually happens due to a temporary issue.
            </p>
            
            <div className={styles.errorActions}>
              <button 
                onClick={this.handleReset}
                className={styles.primaryButton}
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                className={styles.secondaryButton}
              >
                Reload Page
              </button>
            </div>

            {/* Show error details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;