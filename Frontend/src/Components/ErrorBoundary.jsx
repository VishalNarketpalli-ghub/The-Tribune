import React from "react";

/**
 * ErrorBoundary — catches unhandled JavaScript errors in any child component tree.
 *
 * This is a class component because React's error boundary API (getDerivedStateFromError
 * and componentDidCatch) is only available on class components, not function components.
 *
 * When an error is caught, the user sees a friendly error page instead of a blank screen.
 * The " Return home" link uses a full page reload (<a href="/") rather than React Router's
 * <Link> because the router itself may be in a broken state after a severe error.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    // Update state so the next render shows the fallback UI
    static getDerivedStateFromError() {
        return { hasError: true };
    }

    // Log the error to the console (or a monitoring service in production)
    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught an error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center px-6">
                    <div className="max-w-sm w-full text-center">
                        {/* Decorative top strip matching the brand palette */}
                        <div className="h-1 w-24 bg-gradient-to-r from-[#C4590A] to-[#E8893A] rounded-full mx-auto mb-8" />

                        <p className="font-display text-5xl font-bold text-[#1C1B18] mb-3">
                            Oops
                        </p>
                        <p className="font-serif text-lg italic text-[#7A736A] mb-8">
                            Something went wrong on this page.
                        </p>

                        {/* Full reload link — avoids relying on a potentially broken router */}
                        <a
                            href="/"
                            className="inline-block px-6 py-2.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                        >
                            Return to home
                        </a>
                    </div>
                </div>
            );
        }

        // No error — render children normally
        return this.props.children;
    }
}

export default ErrorBoundary;
