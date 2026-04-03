import { userAuth } from "../Store/authStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

const tagPalette = [
    { bg: "#FBF0E6", text: "#9E4407" },
    { bg: "#EAF2F2", text: "#1E5C5C" },
    { bg: "#F0EDF8", text: "#5C3A8A" },
    { bg: "#FFF0F0", text: "#A02020" },
    { bg: "#F0F7EC", text: "#2F6A10" },
    { bg: "#FEF9E6", text: "#8A6000" },
];
const getTag = (str = "") => tagPalette[str.charCodeAt(0) % tagPalette.length];

function UserProfile() {
    const [articles, setArticles] = useState([]);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState(null);

    const navigate    = useNavigate();
    const logout      = userAuth((state) => state.logout);
    const currentUser = userAuth((state) => state.currentUser);

    const onLogout = async () => { await logout(); navigate("/login"); };

    const viewArticle = (article) =>
        navigate(`/article/${article._id}`, { state: article });

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                let res = await axios.get(
                    "http://localhost:4000/user-api/user",
                    { withCredentials: true },
                );
                setArticles(res.data.payload);
            } catch (error) {
                console.log("error ", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <div className="border border-red-200 bg-red-50 rounded-lg px-6 py-5 text-red-600 text-sm max-w-sm w-full text-center">
                    {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">

            {/* ── Reader banner ────────────────────────────────── */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#2D6E6E] font-semibold mb-1">
                            Reader Profile
                        </p>
                        <h1 className="font-display text-3xl font-bold text-[#1C1B18] leading-tight">
                            {currentUser?.firstName} {currentUser?.lastName}
                        </h1>
                        <p className="text-sm text-[#7A736A] mt-2">
                            <span className="font-bold text-[#1C1B18]">{articles.length}</span>{" "}
                            article{articles.length !== 1 ? "s" : ""} in your reading feed
                        </p>
                    </div>
                    <button
                        id="user-logout-btn"
                        onClick={onLogout}
                        className="px-5 py-2.5 border border-[#C8C0B0] text-[#4A4540] text-sm font-semibold rounded-lg hover:border-[#1C1B18] hover:text-[#1C1B18] transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            {/* ── Article stack feed ──────────────────────────── */}
            <div className="max-w-3xl mx-auto px-6 py-10">

                {articles.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-[#E3DDD0] rounded-2xl">
                        <p className="font-display italic text-2xl text-[#C8C0B0]">
                            No articles to show yet.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-0">
                    {articles.map((e, idx) => {
                        const tag    = getTag(e.category);
                        const excerpt = e.content?.slice(0, 180).trim();
                        const words  = e.content?.split(/\s+/).length || 0;
                        const mins   = Math.max(1, Math.ceil(words / 200));

                        return (
                            <article
                                key={e._id}
                                className={`group flex flex-col gap-3 py-8 ${idx !== 0 ? "border-t border-[#E3DDD0]" : ""}`}
                            >
                                {/* Category pill */}
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                                        style={{ background: tag.bg, color: tag.text }}
                                    >
                                        {e.category}
                                    </span>
                                    <span className="text-xs text-[#C8C0B0]">{mins} min read</span>
                                </div>

                                {/* Title */}
                                <h2
                                    onClick={() => viewArticle(e)}
                                    className="font-display text-2xl font-bold text-[#1C1B18] leading-snug cursor-pointer group-hover:text-[#C4590A] transition-colors duration-200"
                                >
                                    {e.title}
                                </h2>

                                {/* Excerpt */}
                                {excerpt && (
                                    <p className="font-serif text-[#4A4540] text-sm leading-relaxed line-clamp-2">
                                        {excerpt}…
                                    </p>
                                )}

                                {/* Footer row */}
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
                                        Read article →
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

export default UserProfile;
