import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { userAuth } from "../Store/authStore";
import toast from "react-hot-toast";

/**
 * AdminProfile — full administrator dashboard.
 *
 * Access: ADMIN role only (enforced by ProtectedRout in App.jsx).
 *
 * Capabilities:
 *   - View all articles (including archived and admin-deleted) with status badges
 *   - Permanently remove articles from public view (admin delete)
 *     Once admin-deleted, the author CANNOT restore the article.
 *   - View all registered users with their role and active status
 *   - Block a user (prevents login, hides their content from feeds)
 *   - Unblock a previously blocked user
 *
 * Admin accounts are created by developers using the seed script at
 * Backend/scripts/createAdmin.js — they cannot self-register through the UI.
 */
function AdminProfile() {
    const logout      = userAuth((state) => state.logout);
    const currentUser = userAuth((state) => state.currentUser);
    const navigate    = useNavigate();

    // Tab state controls which panel is visible: articles or users
    const [activeTab, setActiveTab] = useState("articles");

    const [articles, setArticles] = useState([]);
    const [users,    setUsers]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);

    const onLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Load all articles and all users in parallel on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articlesRes, usersRes] = await Promise.all([
                    axios.get("http://localhost:4000/admin-api/articles", { withCredentials: true }),
                    axios.get("http://localhost:4000/admin-api/users",    { withCredentials: true }),
                ]);
                setArticles(articlesRes.data.payload);
                setUsers(usersRes.data.payload);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /**
     * Admin-delete an article.
     * Sets isAdminDeleted = true on the backend so the author-side restore
     * endpoint will refuse to reactivate it.
     */
    const deleteArticle = async (articleId) => {
        try {
            await axios.put(
                `http://localhost:4000/admin-api/articles-delete/${articleId}`,
                {},
                { withCredentials: true }
            );
            toast.success("Article removed");
            // Update local state so the badge changes immediately without a re-fetch
            setArticles((prev) =>
                prev.map((a) =>
                    a._id === articleId
                        ? { ...a, isArticleActive: false, isAdminDeleted: true }
                        : a
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not remove article");
        }
    };

    // Block a user — sets isActive = false on the server
    const restoreArticle = async (articleId) => {
        try {
            await axios.put(
                `http://localhost:4000/admin-api/articles-restore/${articleId}`,
                {},
                { withCredentials: true }
            );
            toast.success("Article restored");
            setArticles((prev) =>
                prev.map((a) =>
                    a._id === articleId
                        ? { ...a, isArticleActive: true, isAdminDeleted: false }
                        : a
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not restore article");
        }
    };

    // Block a user — sets isActive = false on the server
    const blockUser = async (uid) => {
        try {
            const res = await axios.put(
                `http://localhost:4000/admin-api/block/${uid}`,
                {},
                { withCredentials: true }
            );
            toast.success(res.data.message);
            // Reflect the change in local user list
            setUsers((prev) =>
                prev.map((u) => (u._id === uid ? { ...u, isActive: false } : u))
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not block user");
        }
    };

    // Unblock a user — sets isActive = true on the server
    const unblockUser = async (uid) => {
        try {
            const res = await axios.put(
                `http://localhost:4000/admin-api/un-block/${uid}`,
                {},
                { withCredentials: true }
            );
            toast.success(res.data.message);
            setUsers((prev) =>
                prev.map((u) => (u._id === uid ? { ...u, isActive: true } : u))
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not unblock user");
        }
    };

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

    // Pre-compute summary stats for the dashboard header
    const totalArticles   = articles.length;
    const activeArticles  = articles.filter((a) => a.isArticleActive).length;
    const removedArticles = articles.filter((a) => a.isAdminDeleted).length;
    const totalUsers      = users.length;
    const blockedUsers    = users.filter((u) => !u.isActive).length;

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">

            {/* Dashboard banner */}
            <div className="bg-[#1C1B18] text-[#FFFEF9]">
                <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#C4590A] font-semibold mb-1">
                            Administrator
                        </p>
                        <h1 className="font-display text-3xl font-bold leading-tight">
                            {currentUser?.firstName} {currentUser?.lastName}
                        </h1>
                        {/* Platform-wide stats summary */}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#C8C0B0]">
                            <span><span className="font-bold text-white">{totalArticles}</span> articles</span>
                            <span className="text-[#4A4540]">·</span>
                            <span><span className="font-bold text-[#2D6E6E]">{activeArticles}</span> published</span>
                            <span className="text-[#4A4540]">·</span>
                            <span><span className="font-bold text-red-400">{removedArticles}</span> removed</span>
                            <span className="text-[#4A4540]">·</span>
                            <span><span className="font-bold text-white">{totalUsers}</span> users</span>
                            {blockedUsers > 0 && (
                                <>
                                    <span className="text-[#4A4540]">·</span>
                                    <span><span className="font-bold text-yellow-400">{blockedUsers}</span> blocked</span>
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        id="admin-logout-btn"
                        onClick={onLogout}
                        className="px-5 py-2.5 border border-[#4A4540] text-[#C8C0B0] text-sm font-semibold rounded-lg hover:border-[#C8C0B0] hover:text-white transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
                    >
                        Sign out
                    </button>
                </div>

                {/* Tab navigation */}
                <div className="max-w-5xl mx-auto px-6 flex gap-1 border-t border-[#2D2C28]">
                    {["articles", "users"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-semibold capitalize transition-colors cursor-pointer ${
                                activeTab === tab
                                    ? "text-[#C4590A] border-b-2 border-[#C4590A]"
                                    : "text-[#7A736A] hover:text-[#C8C0B0]"
                            }`}
                        >
                            {tab === "articles"
                                ? `Articles (${totalArticles})`
                                : `Users (${totalUsers})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Articles tab ── */}
            {activeTab === "articles" && (
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex flex-col gap-0">
                        {articles.length === 0 && (
                            <p className="text-center py-20 font-serif italic text-[#7A736A]">
                                No articles in the system yet.
                            </p>
                        )}
                        {articles.map((a, idx) => (
                            <div
                                key={a._id}
                                className={`flex flex-col sm:flex-row sm:items-start gap-4 py-6 ${idx !== 0 ? "border-t border-[#E3DDD0]" : ""}`}
                            >
                                {/* Article info */}
                                <div className="flex-1 min-w-0">
                                    {/* Status badge */}
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {a.isAdminDeleted ? (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                                Admin Removed
                                            </span>
                                        ) : a.isArticleActive ? (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF2F2] text-[#2D6E6E]">
                                                Published
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F7F3EA] text-[#7A736A]">
                                                Archived
                                            </span>
                                        )}
                                        {a.category && (
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A736A]">
                                                {a.category}
                                            </span>
                                        )}
                                    </div>

                                    <p 
                                        className="font-display font-bold text-[#1C1B18] leading-snug line-clamp-2 cursor-pointer hover:text-[#C4590A] transition-colors duration-200"
                                        onClick={() => navigate(`/article/${a._id}`, { state: a })}
                                    >
                                        {a.title}
                                    </p>
                                    <p className="text-xs text-[#7A736A] mt-1">
                                        by {a.author?.firstName} {a.author?.lastName} · {a.author?.email}
                                    </p>
                                </div>

                                {/* Admin actions */}
                                <div className="flex flex-col gap-2 flex-shrink-0 self-start">
                                    <button
                                        onClick={() => navigate(`/article/${a._id}`, { state: a })}
                                        className="px-4 py-2 border border-[#E3DDD0] hover:border-[#2D6E6E] text-[#7A736A] hover:text-[#2D6E6E] text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                                    >
                                        Read article
                                    </button>
                                    {!a.isAdminDeleted ? (
                                        <button
                                            onClick={() => deleteArticle(a._id)}
                                            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                                        >
                                            Remove article
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => restoreArticle(a._id)}
                                            className="px-4 py-2 border border-[#D0E8E8] hover:bg-[#EAF2F2] text-[#2D6E6E] text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                                        >
                                            Restore article
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Users tab ── */}
            {activeTab === "users" && (
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex flex-col gap-0">
                        {users.length === 0 && (
                            <p className="text-center py-20 font-serif italic text-[#7A736A]">
                                No users registered yet.
                            </p>
                        )}
                        {users.map((u, idx) => (
                            <div
                                key={u._id}
                                className={`flex flex-col sm:flex-row sm:items-center gap-4 py-5 ${idx !== 0 ? "border-t border-[#E3DDD0]" : ""}`}
                            >
                                {/* User avatar initial */}
                                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                                    u.role === "AUTHOR" ? "bg-[#C4590A]" :
                                    u.role === "ADMIN"  ? "bg-[#1C1B18]" : "bg-[#2D6E6E]"
                                }`}>
                                    {u.firstName?.[0]?.toUpperCase()}
                                </div>

                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1C1B18]">
                                        {u.firstName} {u.lastName}
                                        {/* Prevent the admin from accidentally blocking themselves */}
                                        {u._id === currentUser?._id && (
                                            <span className="ml-2 text-xs text-[#C4590A] font-normal">(you)</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-[#7A736A]">{u.email}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {/* Role badge */}
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            u.role === "AUTHOR" ? "bg-[#FBF0E6] text-[#9E4407]" :
                                            u.role === "ADMIN"  ? "bg-[#F0EDF8] text-[#5C3A8A]" :
                                                                  "bg-[#EAF2F2] text-[#1E5C5C]"
                                        }`}>
                                            {u.role}
                                        </span>
                                        {/* Active / blocked status badge */}
                                        <span className={`text-[10px] font-semibold ${u.isActive ? "text-[#2D6E6E]" : "text-red-500"}`}>
                                            {u.isActive ? "Active" : "Blocked"}
                                        </span>
                                    </div>
                                </div>

                                {/* Block / Unblock actions — hidden for the currently logged-in admin */}
                                {u._id !== currentUser?._id && u.role !== "ADMIN" && (
                                    <div className="flex-shrink-0">
                                        {u.isActive ? (
                                            <button
                                                onClick={() => blockUser(u._id)}
                                                className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                            >
                                                Block user
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => unblockUser(u._id)}
                                                className="px-4 py-2 border border-[#D0E8E8] hover:bg-[#EAF2F2] text-[#2D6E6E] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                            >
                                                Unblock user
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminProfile;