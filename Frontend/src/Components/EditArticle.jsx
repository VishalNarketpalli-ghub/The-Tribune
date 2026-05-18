import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router";

function EditArticle() {
    const { articleId } = useParams();
    const location = useLocation();
    const [article,  setArticle]  = useState(location.state || null);
    const [loading,  setLoading]  = useState(!location.state);
    const [error,    setError]    = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!article) {
            const fetchArticle = async () => {
                try {
                    const res = await axios.get(
                        `${import.meta.env.VITE_API_URL}/common-api/article/${articleId}`,
                        { withCredentials: true },
                    );
                    setArticle(res.data.payload);
                } catch (err) {
                    setError(err.response?.data?.message || err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchArticle();
        }
    }, [articleId, article]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (!article) return;
        setValue("title",    article.title);
        setValue("category", article.category);
        setValue("content",  article.content);
    }, [article]);

    const updateArticle = async (data) => {
        const reqData = {
            author:    article.author._id,
            articleId: article._id,
            title:     data.title,
            category:  data.category,
            content:   data.content,
        };
        const res = await axios.patch(
            `${import.meta.env.VITE_API_URL}/author-api/articles`,
            reqData,
            { withCredentials: true },
        );
        navigate(`/article/${res.data.payload._id}`, { state: res.data.payload });
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

    if (!article)
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <p className="font-display italic text-xl text-[#7A736A]">
                    Article not found.
                </p>
            </div>
        );

    const inputCls =
        "border border-[#E3DDD0] bg-white rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all w-full";
    const labelCls = "text-xs uppercase tracking-widest text-[#7A736A] font-semibold";
    const errCls   = "text-xs text-red-500 mt-0.5";

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">
            {/* Header */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs uppercase tracking-widest text-[#2D6E6E] font-semibold mb-1">
                        Editing
                    </p>
                    <h1 className="font-display text-3xl font-bold text-[#1C1B18] line-clamp-1">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <form onSubmit={handleSubmit(updateArticle)} className="flex flex-col gap-7">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Title</label>
                        <input
                            id="edit-title"
                            type="text"
                            className={inputCls}
                            {...register("title", { required: "Title is required" })}
                        />
                        {errors.title && <p className={errCls}>{errors.title.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Category</label>
                        <input
                            id="edit-category"
                            type="text"
                            className={inputCls}
                            {...register("category", { required: "Category is required" })}
                        />
                        {errors.category && <p className={errCls}>{errors.category.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Content</label>
                        <textarea
                            id="edit-content"
                            rows={22}
                            className={`${inputCls} resize-y whitespace-pre-wrap font-serif text-base leading-relaxed`}
                            {...register("content", { required: "Content is required" })}
                        />
                        {errors.content && <p className={errCls}>{errors.content.message}</p>}
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-[#E3DDD0]">
                        <button
                            id="save-article-btn"
                            type="submit"
                            className="px-6 py-2.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Save changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-sm text-[#7A736A] hover:text-[#4A4540] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditArticle;
