import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

/**
 * Deterministic colour palette for category tags.
 * Shared across all article list views for visual consistency.
 */
const tagPalette = [
    { bg: "#FBF0E6", text: "#9E4407" },
    { bg: "#EAF2F2", text: "#1E5C5C" },
    { bg: "#F0EDF8", text: "#5C3A8A" },
    { bg: "#FFF0F0", text: "#A02020" },
    { bg: "#F0F7EC", text: "#2F6A10" },
    { bg: "#FEF9E6", text: "#8A6000" },
];
const getTag = (str = "") => tagPalette[str.charCodeAt(0) % tagPalette.length];

/**
 * Articles — protected browse page showing all published articles.
 *
 * Accessible to: USER, AUTHOR, ADMIN.
 *
 * Features:
 *   - Fetches all active articles from the user endpoint
 *   - Live search filter by title or category (client-side, no extra API calls)
 *   - Category quick-filter chips derived from the returned data
 *   - Article cards in a readable stack layout matching the rest of the app
 */
function Articles() {
    const [articles,   setArticles]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [search,     setSearch]     = useState("");
    const [activeTag,  setActiveTag]  = useState("All");
    const navigate = useNavigate();

    // Fetch all published articles on mount — same endpoint as the user feed
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/user-api/user`,
                    { withCredentials: true },
                );
                setArticles(res.data.payload);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const viewArticle = (article) =>
        navigate(`/article/${article._id}`, { state: article });

    // Derive unique category list for the filter chips
    const categories = ["All", ...new Set(articles.map((a) => a.category).filter(Boolean))];

    // Apply both the search text filter and the active category filter
    const filtered = articles.filter((a) => {
        const matchesSearch =
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.category?.toLowerCase().includes(search.toLowerCase());
        const matchesTag = activeTag === "All" || a.category === activeTag;
        return matchesSearch && matchesTag;
    });

    if (loading)
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );

    if (error)
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <div className="border border-red-200 bg-red-50 rounded-lg px-6 py-5 text-red-600 text-sm max-w-sm w-full text-center">
                    {error}
                </div>
            </div>
        );

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">

            {/* Page header with search bar */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs uppercase tracking-widest text-[#C4590A] font-semibold mb-1">
                        All Articles
                    </p>
                    <h1 className="font-display text-3xl font-bold text-[#1C1B18] mb-6">
                        Browse the collection
                    </h1>

                    {/* Article search — client-side filter on title and category */}
                    <input
                        id="articles-search"
                        type="text"
                        placeholder="Search by title or category…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border border-[#E3DDD0] bg-white rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all"
                    />
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Category filter chips — derived from actual article data */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTag(cat)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                activeTag === cat
                                    ? "bg-[#1C1B18] text-[#FFFEF9] border-[#1C1B18]"
                                    : "bg-white text-[#4A4540] border-[#E3DDD0] hover:border-[#C4590A] hover:text-[#C4590A]"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Result count */}
                <p className="text-xs text-[#7A736A] mb-6 uppercase tracking-widest">
                    {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                    {activeTag !== "All" ? ` in ${activeTag}` : ""}
                </p>

                {/* Empty state when no articles match the current filters */}
                {filtered.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-[#E3DDD0] rounded-2xl">
                        <p className="font-display italic text-2xl text-[#C8C0B0]">
                            No articles match your search.
                        </p>
                        <button
                            onClick={() => { setSearch(""); setActiveTag("All"); }}
                            className="mt-4 text-sm text-[#C4590A] font-semibold hover:underline underline-offset-2"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Article stack — same card layout used across all list views */}
                <div className="flex flex-col gap-0">
                    {filtered.map((e, idx) => {
                        const tag    = getTag(e.category);
                        const excerpt = e.content?.slice(0, 180).trim();
                        const words  = e.content?.split(/\s+/).length || 0;
                        const mins   = Math.max(1, Math.ceil(words / 200));

                        return (
                            <article
                                key={e._id}
                                className={`group flex flex-col gap-3 py-8 ${idx !== 0 ? "border-t border-[#E3DDD0]" : ""}`}
                            >
                                {/* Category pill + read time */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                                        style={{ background: tag.bg, color: tag.text }}
                                    >
                                        {e.category}
                                    </span>
                                    <span className="text-xs text-[#C8C0B0]">{mins} min read</span>
                                </div>

                                {/* Article title — primary click target */}
                                <h2
                                    onClick={() => viewArticle(e)}
                                    className="font-display text-2xl font-bold text-[#1C1B18] leading-snug cursor-pointer group-hover:text-[#C4590A] transition-colors duration-200"
                                >
                                    {e.title}
                                </h2>

                                {/* Content excerpt preview */}
                                {excerpt && (
                                    <p className="font-serif text-[#4A4540] text-sm leading-relaxed line-clamp-2">
                                        {excerpt}…
                                    </p>
                                )}

                                {/* Footer: author + read link */}
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2 text-xs text-[#7A736A]">
                                        <div className="w-6 h-6 rounded-full bg-[#2D6E6E] text-white flex items-center justify-center text-[10px] font-bold">
                                            {e.author?.firstName?.[0]?.toUpperCase()}
                                        </div>
                                        <span>by {e.author?.firstName}</span>
                                    </div>
                                    <button
                                        onClick={() => viewArticle(e)}
                                        className="text-xs font-semibold text-[#C4590A] hover:underline underline-offset-2 cursor-pointer"
                                    >
                                        Read article
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Articles;
