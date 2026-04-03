import { useLocation, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { userAuth } from "../Store/authStore";
import axios from "axios";
import { useEffect, useState } from "react";

const tagPalette = [
    { bg: "#FBF0E6", text: "#9E4407" },
    { bg: "#EAF2F2", text: "#1E5C5C" },
    { bg: "#F0EDF8", text: "#5C3A8A" },
    { bg: "#FFF0F0", text: "#A02020" },
    { bg: "#F0F7EC", text: "#2F6A10" },
    { bg: "#FEF9E6", text: "#8A6000" },
];
const getTag = (str = "") => tagPalette[str.charCodeAt(0) % tagPalette.length];

function ArticleById() {
    const { articleId } = useParams();
    const location      = useLocation();
    const [currentArticle, setCurrentArticle] = useState(location.state || null);
    const [loading, setLoading] = useState(!location.state);
    const [error,   setError]   = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentArticle) {
            const fetchArticle = async () => {
                try {
                    const res = await axios.get(
                        `http://localhost:4000/common-api/article/${articleId}`,
                        { withCredentials: true },
                    );
                    setCurrentArticle(res.data.payload);
                    console.log(res.data.payload);
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchArticle();
        }
    }, [articleId, currentArticle]);

    const currentUser = userAuth((state) => state.currentUser);
    const role        = currentUser?.role;

    const { register, handleSubmit, reset } = useForm();

    const submitComment = async (newComment) => {
        const reqData = {
            uid:       currentUser._id,
            articleId: currentArticle._id,
            comment:   newComment.comment,
        };
        await axios.post(
            "http://localhost:4000/user-api/users-comment",
            reqData,
            { withCredentials: true },
        );
        reset();
    };

    /* ── States ─────────────────────────────────────────────────── */
    if (loading)
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-[#7A736A]">Loading…</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
                <div className="border border-red-200 bg-red-50 rounded-lg px-6 py-5 text-red-600 text-sm max-w-sm w-full text-center">
                    {error}
                </div>
            </div>
        );

    if (!currentArticle)
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-6">
                <p className="font-display italic text-xl text-[#7A736A]">
                    Article not found.
                </p>
            </div>
        );

    const deleteArticle = async () => {
        await axios.put(
            "http://localhost:4000/author-api/articles-delete",
            { authorId: currentUser._id, articleId: currentArticle._id },
            { withCredentials: true },
        );
    };

    const fmt = (iso) =>
        new Date(iso).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });

    const words    = currentArticle.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const tag      = getTag(currentArticle.category);

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">

            {/* ── Article header ──────────────────────────────────── */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 pt-12 pb-10">

                    {/* Category + status row */}
                    <div className="flex items-center gap-3 flex-wrap mb-5">
                        <span
                            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                            style={{ background: tag.bg, color: tag.text }}
                        >
                            {currentArticle.category}
                        </span>
                        {currentArticle.isArticleActive && (
                            <span className="flex items-center gap-1.5 text-xs text-[#2D6E6E] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6E6E]" />
                                Published
                            </span>
                        )}
                        <span className="text-xs text-[#7A736A]">· {readTime} min read</span>
                    </div>

                    {/* Title */}
                    <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1C1B18] leading-tight mb-6">
                        {currentArticle.title}
                    </h1>

                    {/* Author + dates */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#C4590A] text-white flex items-center justify-center font-display font-bold text-sm">
                                {currentArticle.author?.firstName?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#1C1B18]">
                                    {currentArticle.author?.firstName}
                                </p>
                                <p className="text-xs text-[#7A736A]">Author</p>
                            </div>
                        </div>
                        <div className="text-xs text-[#7A736A] sm:text-right space-y-0.5">
                            <p>Published {fmt(currentArticle.createdAt)}</p>
                            <p>Updated {fmt(currentArticle.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Article body ────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto px-6 py-12">
                <p className="font-serif text-[1.1rem] leading-[1.95] text-[#2a2520] whitespace-pre-wrap">
                    {currentArticle.content}
                </p>

                {/* ── Author actions ───────────────────────────────── */}
                {role === "AUTHOR" && (
                    <div className="mt-12 pt-8 border-t border-[#E3DDD0] flex flex-wrap gap-3">
                        <button
                            id="edit-article-btn"
                            onClick={() =>
                                navigate(`/edit-article/${currentArticle._id}`, {
                                    state: currentArticle,
                                })
                            }
                            className="px-5 py-2.5 bg-[#2D6E6E] hover:bg-[#1E5C5C] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Edit article
                        </button>
                        <button
                            id="delete-article-btn"
                            onClick={deleteArticle}
                            className="px-5 py-2.5 border border-[#E3DDD0] hover:border-red-300 text-[#7A736A] hover:text-red-600 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Delete article
                        </button>
                    </div>
                )}

                {/* ── Comments section ─────────────────────────────── */}
                <div className="mt-14">
                    <div className="flex items-baseline gap-3 mb-8 pb-5 border-b border-[#E3DDD0]">
                        <h2 className="font-display text-2xl font-bold text-[#1C1B18]">
                            Responses
                        </h2>
                        <span className="text-sm text-[#7A736A]">
                            ({currentArticle.comments.length})
                        </span>
                    </div>

                    {/* Add comment — USER only */}
                    {role === "USER" && (
                        <form
                            onSubmit={handleSubmit(submitComment)}
                            className="mb-10 flex gap-3 items-start"
                        >
                            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#2D6E6E] text-white flex items-center justify-center text-xs font-bold font-display mt-0.5">
                                {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                <input
                                    id="comment-input"
                                    type="text"
                                    placeholder="Share your thoughts…"
                                    className="flex-1 border border-[#E3DDD0] bg-white rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all"
                                    {...register("comment")}
                                />
                                <button
                                    id="submit-comment-btn"
                                    type="submit"
                                    className="px-5 py-2.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                >
                                    Respond
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Comment list */}
                    <div className="flex flex-col">
                        {currentArticle.comments.length === 0 && (
                            <p className="py-10 text-sm text-[#7A736A] italic text-center font-serif">
                                No responses yet — be the first to share your thoughts.
                            </p>
                        )}
                        {currentArticle.comments.map((e) => (
                            <div
                                key={e._id}
                                className="py-6 flex gap-4 border-b border-[#E3DDD0] last:border-0"
                            >
                                <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#F7F3EA] border border-[#E3DDD0] text-[#4A4540] flex items-center justify-center text-xs font-bold font-display">
                                    {e.user?.firstName?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1C1B18] mb-1">
                                        {e.user?.firstName || "Anonymous"}
                                    </p>
                                    <p className="font-serif text-sm text-[#4A4540] leading-relaxed break-words">
                                        {e.comments}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArticleById;
