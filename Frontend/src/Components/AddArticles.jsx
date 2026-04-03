import { useState } from "react";
import { useForm } from "react-hook-form";
import { userAuth } from "../Store/authStore";
import axios from "axios";
import { useNavigate } from "react-router";

function AddArticles() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate    = useNavigate();
    const [error,   setError]   = useState();
    const [loading, setLoading] = useState();
    const currentUser = userAuth((state) => state.currentUser);

    const createNewArticle = async (data) => {
        const reqData = {
            author:   currentUser._id,
            title:    data.title,
            category: data.category,
            content:  data.content,
        };
        console.log(reqData);
        const res = await axios.post(
            "http://localhost:4000/author-api/articles",
            reqData,
            { withCredentials: true },
        );
        navigate(`/article/${res.data.payload._id}`);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const inputCls =
        "border border-[#E3DDD0] bg-white rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all w-full";
    const labelCls = "text-xs uppercase tracking-widest text-[#7A736A] font-semibold";
    const errCls   = "text-xs text-red-500 mt-0.5";

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9]">
            {/* Header */}
            <div className="bg-[#F7F3EA] border-b border-[#E3DDD0]">
                <div className="max-w-3xl mx-auto px-6 py-10">
                    <p className="text-xs uppercase tracking-widest text-[#C4590A] font-semibold mb-1">
                        New Article
                    </p>
                    <h1 className="font-display text-3xl font-bold text-[#1C1B18]">
                        Write something
                    </h1>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <form onSubmit={handleSubmit(createNewArticle)} className="flex flex-col gap-7">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Title</label>
                        <input
                            id="article-title"
                            type="text"
                            placeholder="Give your article a compelling title…"
                            className={inputCls}
                            {...register("title", { required: "Title is required" })}
                        />
                        {errors.title && <p className={errCls}>{errors.title.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Category</label>
                        <input
                            id="article-category"
                            type="text"
                            placeholder="e.g. Technology, Culture, Life…"
                            className={inputCls}
                            {...register("category", { required: "Category is required" })}
                        />
                        {errors.category && <p className={errCls}>{errors.category.message}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelCls}>Content</label>
                        <textarea
                            id="article-content"
                            rows={22}
                            placeholder="Tell your story…"
                            className={`${inputCls} resize-y whitespace-pre-wrap font-serif text-base leading-relaxed`}
                            {...register("content", { required: "Content is required" })}
                        />
                        {errors.content && <p className={errCls}>{errors.content.message}</p>}
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-[#E3DDD0]">
                        <button
                            id="publish-article-btn"
                            type="submit"
                            className="px-6 py-2.5 bg-[#C4590A] hover:bg-[#9E4407] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Publish article
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

export default AddArticles;
