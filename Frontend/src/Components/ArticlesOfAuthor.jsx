import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";

/** Deterministic category tag colour — consistent with all other article views. */
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
 * ArticlesOfAuthor — shows all published articles by a specific author.
 *
 * Route param: authorId (MongoDB ObjectId)
 * Accessible to: USER, AUTHOR, ADMIN (any authenticated user)
 *
 * This page is reached when a reader clicks on an author name anywhere in the app.
 * It re-uses the author articles endpoint but only displays active (published) articles
 * since non-authors should not see archived or admin-removed content.
 */
function ArticlesOfAuthor() {
    const { authorId } = useParams();
    const navigate     = useNavigate();

    const [articles,    setArticles]    = useState([]);
    const [authorName,  setAuthorName]  = useState("");
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);

    // Fetch articles by this author and extract the author's display name
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/author-api/articles/${authorId}`,
                    { withCredentials: true },
                );

                const all = res.data.payload;

                // Extract the author's name from the first article's populated author field
                if (all.length > 0 && all[0].author?.firstName) {
                    setAuthorName(
                        `${all[0].author.firstName} ${all[0].author.lastName || ""}`.trim()
                    );
                }

                // Only show articles that the author has not archived or that admin removed
                setArticles(all.filter((a) => a.isArticleActive && !a.isAdminDeleted));
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [authorId]);

    const viewArticle = (article) =>
        navigate(`/article/${article._id}`, { state: article });

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

            {/* Author page header */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs uppercase tracking-widest text-[#2D6E6E] font-semibold mb-1">
                        Author
                    </p>
                    <h1 className="font-display text-3xl font-bold text-[#1C1B18]">
                        {authorName || "Articles by this author"}
                    </h1>
                    <p className="text-sm text-[#7A736A] mt-2">
                        <span className="font-bold text-[#1C1B18]">{articles.length}</span>{" "}
                        published article{articles.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Empty state: author exists but has no published articles */}
                {articles.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-[#E3DDD0] rounded-2xl">
                        <p className="font-display italic text-2xl text-[#C8C0B0]">
                            No published articles yet.
                        </p>
                    </div>
                )}

                {/* Article stack */}
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
                                {/* Category + read time */}
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

                                {/* Read link */}
                                <div className="flex justify-end mt-1">
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

export default ArticlesOfAuthor;