import { useNavigate } from "react-router";
import { userAuth } from "../Store/authStore";

/**
 * Home — landing page for The Tribune.
 *
 * For unauthenticated visitors:
 *   Displays a full editorial hero with brand story, feature highlights,
 *   and CTAs to register or sign in.
 *
 * For authenticated users:
 *   Shows a personalised welcome with a direct link to their dashboard,
 *   keeping the experience contextual rather than repeating the guest CTA.
 *
 * No article data is fetched here — articles require authentication and
 * are shown in the protected /articles route or profile dashboards.
 */
function Home() {
    const isAuthenticated = userAuth((state) => state.isAuthenticated);
    const currentUser     = userAuth((state) => state.currentUser);
    const navigate        = useNavigate();

    // Resolve the correct dashboard path based on the user's role
    const getDashboardPath = () => {
        if (currentUser?.role === "AUTHOR") return "/author-profile";
        if (currentUser?.role === "ADMIN")  return "/admin-profile";
        return "/user-profile";
    };

    return (
        <div className="bg-[#FFFEF9] min-h-[80vh]">

            {/* ── Hero section ── */}
            <section className="relative overflow-hidden">
                {/* Subtle warm background gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7F3EA] via-[#FFFEF9] to-[#EAF2F2] pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
                    {/* Eyebrow label */}
                    <p className="inline-block text-xs uppercase tracking-[0.2em] text-[#C4590A] font-semibold mb-6 px-4 py-1.5 bg-[#FBF0E6] rounded-full">
                        Est. 2024 — Words Worth Reading
                    </p>

                    {/* Masthead headline */}
                    <h1 className="font-display text-6xl sm:text-7xl font-bold text-[#1C1B18] leading-[1.05] mb-6">
                        The Tribune
                    </h1>

                    {/* Tagline */}
                    <p className="font-serif text-xl text-[#4A4540] max-w-2xl mx-auto leading-relaxed mb-10">
                        A curated editorial platform where thoughtful authors share
                        long-form writing on culture, technology, life and ideas.
                    </p>

                    {/* CTA block — changes based on authentication state */}
                    {isAuthenticated ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate("/articles")}
                                className="px-8 py-3.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Browse articles
                            </button>
                            <button
                                onClick={() => navigate(getDashboardPath())}
                                className="px-8 py-3.5 border border-[#E3DDD0] hover:border-[#1C1B18] text-[#4A4540] hover:text-[#1C1B18] text-sm font-semibold rounded-xl transition-all duration-200 bg-white"
                            >
                                Go to my {currentUser?.role === "AUTHOR" ? "dashboard" : "feed"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate("/register")}
                                className="px-8 py-3.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Start reading — it&apos;s free
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="px-8 py-3.5 border border-[#E3DDD0] hover:border-[#1C1B18] text-[#4A4540] hover:text-[#1C1B18] text-sm font-semibold rounded-xl transition-all duration-200 bg-white"
                            >
                                Sign in
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Divider ── */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#E3DDD0] to-transparent mx-8" />

            {/* ── Feature highlights ── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <p className="text-center text-xs uppercase tracking-[0.2em] text-[#7A736A] font-semibold mb-12">
                    Why readers and authors choose The Tribune
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

                    {/* Feature card 1 — Editorial quality */}
                    <div className="flex flex-col gap-4 p-7 bg-[#F7F3EA] rounded-2xl border border-[#E3DDD0] hover:shadow-md transition-shadow duration-200">
                        <div className="w-11 h-11 rounded-xl bg-[#FBF0E6] flex items-center justify-center">
                            {/* Pen icon */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C4590A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                            </svg>
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#1C1B18]">
                            Curated writing
                        </h3>
                        <p className="font-serif text-sm text-[#7A736A] leading-relaxed">
                            Every article is written by a verified author committed to
                            informed, nuanced long-form content.
                        </p>
                    </div>

                    {/* Feature card 2 — Reader community */}
                    <div className="flex flex-col gap-4 p-7 bg-[#EAF2F2] rounded-2xl border border-[#D0E8E8] hover:shadow-md transition-shadow duration-200">
                        <div className="w-11 h-11 rounded-xl bg-[#C8E6E6] flex items-center justify-center">
                            {/* Chat icon */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2D6E6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#1C1B18]">
                            Reader responses
                        </h3>
                        <p className="font-serif text-sm text-[#7A736A] leading-relaxed">
                            Engage directly with authors through thoughtful comments
                            on every article.
                        </p>
                    </div>

                    {/* Feature card 3 — Author tools */}
                    <div className="flex flex-col gap-4 p-7 bg-[#F0EDF8] rounded-2xl border border-[#DDD8F0] hover:shadow-md transition-shadow duration-200">
                        <div className="w-11 h-11 rounded-xl bg-[#E0DAF5] flex items-center justify-center">
                            {/* Dashboard icon */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            </svg>
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#1C1B18]">
                            Author dashboard
                        </h3>
                        <p className="font-serif text-sm text-[#7A736A] leading-relaxed">
                            A clean workspace for writing, publishing, editing and
                            managing your entire article portfolio.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Author CTA ── (shown only to guests or readers, not to authors already) */}
            {(!isAuthenticated || currentUser?.role === "USER") && (
                <section className="bg-[#1C1B18] py-16">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#C4590A] font-semibold mb-3">
                            For writers
                        </p>
                        <h2 className="font-display text-4xl font-bold text-[#FFFEF9] mb-4 leading-tight">
                            Share your ideas with the world
                        </h2>
                        <p className="font-serif text-[#C8C0B0] text-base leading-relaxed mb-8 max-w-xl mx-auto">
                            Join The Tribune as an author. Publish your articles, build
                            an audience and be part of a community that values quality writing.
                        </p>
                        <button
                            onClick={() => navigate("/register")}
                            className="px-8 py-3.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-xl transition-all duration-200"
                        >
                            Apply as an author
                        </button>
                    </div>
                </section>
            )}

            {/* ── Footer spacer ── */}
            <div className="h-10" />
        </div>
    );
}

export default Home;