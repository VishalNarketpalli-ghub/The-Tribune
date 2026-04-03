import { Outlet } from "react-router";
import Header from "./Header";
import { useEffect } from "react";
import { userAuth } from "../Store/authStore";

function RootLayout() {
    const checkAuth = userAuth((state) => state.checkAuth);
    const loading = userAuth((state) => state.loading);

    useEffect(() => {
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#7A736A] text-xs tracking-widest uppercase font-sans">
                        Loading…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFEF9]">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t border-[#E3DDD0] bg-[#F7F3EA]">
                <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="font-display italic text-[#C4590A] text-lg font-bold">
                        The Tribune
                    </p>
                    <p className="text-xs text-[#7A736A] tracking-wide">
                        © {new Date().getFullYear()} The Tribune · Words worth reading.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default RootLayout;
