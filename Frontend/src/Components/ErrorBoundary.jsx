import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-6">
                    <div className="max-w-sm w-full text-center border border-[#d4d2cb] rounded p-10">
                        <p className="font-serif text-4xl font-bold text-[#0e0e0e] mb-2">
                            404
                        </p>
                        <p className="font-serif text-lg italic text-[#4a4a4a] mb-6">
                            Something went wrong.
                        </p>
                        <a
                            href="/"
                            className="text-sm underline underline-offset-2 text-[#4a4a4a] hover:text-[#0e0e0e] transition-colors"
                        >
                            ← Return home
                        </a>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
