import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";
import { useEffect } from "react";
import { userAuth } from "../Store/authStore";

/**
 * RootLayout — the persistent shell that wraps every page in the application.
 *
 * Responsibilities:
 *   1. Runs checkAuth on mount to restore the user's session from the HTTP-only
 *      cookie. This keeps the app authenticated across page refreshes without
 *      requiring the user to log in again.
 *   2. Shows a full-screen loading indicator while the auth check is in-flight
 *      so that ProtectedRout components receive a settled auth state rather than
 *      a false "unauthenticated" during the brief loading window.
 *   3. Renders the sticky Header, the page-specific Outlet content, and the Footer
 *      in a flex-column layout so the footer always sits at the bottom.
 */
function RootLayout() {
    const checkAuth = userAuth((state) => state.checkAuth);
    const loading   = userAuth((state) => state.loading);

    useEffect(() => {
        // Attempt to restore the session from the JWT stored in the cookie.
        // This fires once on initial app load.
        checkAuth();
    }, []);

    // Block child rendering until the auth state is settled to avoid
    // a flash-of-protected-content or an incorrect redirect to /login.
    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#7A736A] text-xs tracking-widest uppercase font-sans">
                        Loading
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFEF9]">
            {/* Sticky header — always visible at the top of the viewport */}
            <Header />

            {/* Page content area — grows to fill available vertical space */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer — rendered by the Footer component for maintainability */}
            <Footer />
        </div>
    );
}

export default RootLayout;
