import { useEffect, useState } from "react";
import { userAuth } from "../Store/authStore";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * Deterministic colour palette for category tags.
 * Given a category string, always returns the same colour pair so the UI
 * looks consistent across page loads without storing colour data per article.
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
 * AuthorProfile — the author's personal dashboard.
 *
 * Displays:
 *   - Author stats (total, published, archived counts)
 *   - Quick actions (write new article, sign out)
 *   - A full article list with per-article actions:
 *       Read, Edit, Archive (soft-delete), Restore
 *       Restore is blocked for articles that an admin has permanently removed.
 */
function AuthorProfile() {
    const logout      = userAuth((state) => state.logout);
    const currentUser = userAuth((state) => state.currentUser);
    const navigate    = useNavigate();

    const [loading,    setLoading]    = useState(true);
    const [articleObj, setArticleObj] = useState([]);

    const onLogout = async () => {
        await logout();
        navigate("/login");
    };

    const viewArticle = (article) =>
        navigate(`/article/${article._id}`, { state: article });

    // Fetch all articles (active + archived) for this author
    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/author-api/articles/${currentUser._id}`,
                { withCredentials: true },
            );
            setArticleObj(res.data.payload);
        } catch (err) {
            toast.error("Could not load articles");
            console.error(err);
        } finally {
            // Always clear loading even if the request fails
            setLoading(false);
        }
    };

    // Fetch once on mount; do NOT include articleObj in the dependency array
    // or every state update will trigger an infinite re-fetch loop
    useEffect(() => {
        fetchArticles();
    }, []);

    // Soft-delete an article — sets isArticleActive = false on the server.
    // The author can restore this later unless an admin removes it.
    const archiveArticle = async (article) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/author-api/articles-delete`,
                { authorId: currentUser._id, articleId: article._id },
                { withCredentials: true },
            );
            toast.success("Article archived");
            // Update local state so the UI reflects the change immediately
            setArticleObj((prev) =>
                prev.map((a) => (a._id === article._id ? { ...a, isArticleActive: false } : a))
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not archive article");
        }
    };

    // Restore a previously archived article.
    // Will be rejected by the server with 403 if an admin removed it.
    const restoreArticle = async (article) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/author-api/article-reload`,
                { authorId: article.author._id, articleId: article._id },
                { withCredentials: true },
            );
            toast.success("Article restored");
            setArticleObj((prev) =>
                prev.map((a) => (a._id === article._id ? { ...a, isArticleActive: true } : a))
            );
        } catch (err) {
            // The 403 case surfaces a meaningful message from the backend
            toast.error(err.response?.data?.message || "Could not restore article");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Pre-compute stats for the dashboard banner
    const active      = articleObj?.filter((a) => a.isArticleActive).length  ?? 0;
    const archived    = articleObj?.filter((a) => !a.isArticleActive && !a.isAdminDeleted).length ?? 0;
    const adminRemoved = articleObj?.filter((a) => a.isAdminDeleted).length ?? 0;

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">

            {/* Dashboard banner — shows author name, stats and quick actions */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#C4590A] font-semibold mb-1">
                            Author Dashboard
                        </p>
                        <h1 className="font-display text-3xl font-bold text-[#1C1B18] leading-tight">
                            {currentUser?.firstName} {currentUser?.lastName}
                        </h1>
                        {/* Article count summary */}
                        <div className="flex flex-wrap gap-4 mt-3">
                            <span className="text-sm text-[#4A4540]">
                                <span className="font-bold text-[#1C1B18]">{articleObj?.length ?? 0}</span> total
                            </span>
                            <span className="text-[#C8C0B0]">·</span>
                            <span className="text-sm text-[#4A4540]">
                                <span className="font-bold text-[#2D6E6E]">{active}</span> published
                            </span>
                            <span className="text-[#C8C0B0]">·</span>
                            <span className="text-sm text-[#4A4540]">
                                <span className="font-bold text-[#7A736A]">{archived}</span> archived
                            </span>
                            {/* Only show the admin-removed count if there are any */}
                            {adminRemoved > 0 && (
                                <>
                                    <span className="text-[#C8C0B0]">·</span>
                                    <span className="text-sm text-[#4A4540]">
                                        <span className="font-bold text-red-500">{adminRemoved}</span> removed by admin
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 flex-shrink-0">
                        <button
                            id="create-article-btn"
                            onClick={() => navigate("/add-articles")}
                            className="px-5 py-2.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            + Write article
                        </button>
                        <button
                            id="author-logout-btn"
                            onClick={onLogout}
                            className="px-5 py-2.5 border border-[#C8C0B0] text-[#4A4540] text-sm font-semibold rounded-lg hover:border-[#1C1B18] hover:text-[#1C1B18] transition-colors cursor-pointer"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Article feed */}
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Empty state — shown when the author has no articles yet */}
                {(!articleObj || articleObj.length === 0) && (
                    <div className="text-center py-24 border-2 border-dashed border-[#E3DDD0] rounded-2xl">
                        <p className="font-display italic text-2xl text-[#C8C0B0] mb-4">
                            Your collection is empty.
                        </p>
                        <button
                            onClick={() => navigate("/add-articles")}
                            className="text-sm text-[#C4590A] font-semibold hover:underline underline-offset-2"
                        >
                            Write your first article
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-0">
                    {articleObj?.map((e, idx) => {
                        const tag    = getTag(e.category);
                        const excerpt = e.content?.slice(0, 160).trim();

                        return (
                            <article
                                key={e._id}
                                className={`group flex flex-col gap-3 py-8 ${idx !== 0 ? "border-t border-[#E3DDD0]" : ""}`}
                            >
                                {/* Category pill + status badge */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                                        style={{ background: tag.bg, color: tag.text }}
                                    >
                                        {e.category}
                                    </span>
                                    {/* Status badge: shows different states in clear priority order */}
                                    {e.isAdminDeleted ? (
                                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Removed by Admin
                                        </span>
                                    ) : e.isArticleActive ? (
                                        <span className="flex items-center gap-1 text-xs text-[#2D6E6E] font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#2D6E6E]" /> Published
                                        </span>
                                    ) : (
                                        <span className="text-xs text-[#7A736A] italic">Archived</span>
                                    )}
                                </div>

                                {/* Article title — clickable to read full article */}
                                <h2
                                    onClick={() => viewArticle(e)}
                                    className="font-display text-2xl font-bold text-[#1C1B18] leading-snug cursor-pointer group-hover:text-[#C4590A] transition-colors duration-200"
                                >
                                    {e.title}
                                </h2>

                                {/* Content excerpt */}
                                {excerpt && (
                                    <p className="font-serif text-[#4A4540] text-sm leading-relaxed line-clamp-2">
                                        {excerpt}…
                                    </p>
                                )}

                                {/* Action row: read, edit, archive, restore */}
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2 text-xs text-[#7A736A]">
                                        <div className="w-6 h-6 rounded-full bg-[#C4590A] text-white flex items-center justify-center text-[10px] font-bold">
                                            {e.author?.firstName?.[0]?.toUpperCase()}
                                        </div>
                                        <span>{e.author?.firstName}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Read: always available so the author can preview */}
                                        <button
                                            onClick={() => viewArticle(e)}
                                            className="text-xs font-semibold text-[#C4590A] hover:underline underline-offset-2 cursor-pointer"
                                        >
                                            Read
                                        </button>

                                        {/* Edit: only available for active articles */}
                                        {e.isArticleActive && !e.isAdminDeleted && (
                                            <button
                                                onClick={() => navigate(`/edit-article/${e._id}`, { state: e })}
                                                className="text-xs font-semibold border border-[#E3DDD0] hover:border-[#2D6E6E] text-[#7A736A] hover:text-[#2D6E6E] px-3 py-1 rounded-full transition-colors cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {/* Archive: only for active, non-admin-deleted articles */}
                                        {e.isArticleActive && !e.isAdminDeleted && (
                                            <button
                                                onClick={() => archiveArticle(e)}
                                                className="text-xs font-semibold border border-[#E3DDD0] hover:border-red-300 text-[#7A736A] hover:text-red-500 px-3 py-1 rounded-full transition-colors cursor-pointer"
                                            >
                                                Archive
                                            </button>
                                        )}

                                        {/* Restore: only for author-archived articles, NOT admin-deleted */}
                                        {!e.isArticleActive && !e.isAdminDeleted && (
                                            <button
                                                onClick={() => restoreArticle(e)}
                                                className="text-xs font-semibold border border-[#E3DDD0] hover:border-[#2D6E6E] text-[#7A736A] hover:text-[#2D6E6E] px-3 py-1 rounded-full transition-colors cursor-pointer"
                                            >
                                                Restore
                                            </button>
                                        )}

                                        {/* Restore (Disabled): when admin-deleted */}
                                        {!e.isArticleActive && e.isAdminDeleted && (
                                            <button
                                                disabled
                                                className="text-xs font-semibold border border-red-200 text-red-300 px-3 py-1 rounded-full cursor-not-allowed"
                                                title="This article was removed by an administrator and cannot be restored."
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default AuthorProfile;
