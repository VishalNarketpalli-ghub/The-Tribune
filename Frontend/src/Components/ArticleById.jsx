import { useLocation, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { userAuth } from "../Store/authStore";
import axios from "axios";
import { useEffect, useState } from "react";

// import { useState, useEffect } from "react";

function ArticleById() {
    const { articleId } = useParams();
    const location = useLocation();
    const [currentArticle, setCurrentArticle] = useState(
        location.state || null,
    );
    const [loading, setLoading] = useState(!location.state);
    const [error, setError] = useState(null);

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

    // fetch user details and display their name pfp comment

    const currentUser = userAuth((state) => state.currentUser);
    // console.log(currentUser);

    const role = currentUser?.role;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submitComment = async (newComment) => {
        // console.log(newComment.comment);
        const reqData = {
            uid: currentUser._id,
            articleId: currentArticle._id,
            comment: newComment.comment,
        };
        // console.log(reqData);
        const res = await axios.post(
            "http://localhost:4000/user-api/users-comment",
            reqData,
            { withCredentials: true },
        );
        // console.log("res is :", res);
    };

    if (loading)
        return (
            <p className="text-white text-center mt-10 text-2xl">
                Loading article...
            </p>
        );
    if (error)
        return (
            <p className="text-red-500 text-center mt-10 text-2xl">
                Error: {error}
            </p>
        );
    if (!currentArticle)
        return (
            <p className="text-white text-center mt-10 text-2xl">
                Article not found
            </p>
        );

    const deleteArticle = async () => {
        const reqData = {
            authorId: currentUser._id,
            articleId: currentArticle._id,
        };

        const res = await axios.put(
            "http://localhost:4000/author-api/articles-delete",
            reqData,
            { withCredentials: true },
        );

        // console.log(res);

        // setCurrentArticle(res);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black min-w-[415px]">
            <div className="bg-gray-300 pt-5 mx-18">
                <div>
                    {currentArticle.isArticleActive && (
                        <p className="border bg-green-400 w-fit px-2 rounded m-2">
                            Active
                        </p>
                    )}
                </div>
                <p className="text-6xl text-center font-mono">
                    {currentArticle.title}
                </p>
                <p className="text-center">
                    -{currentArticle.author.firstName}
                </p>
                <div className="flex justify-between flex-wrap">
                    <p className="flex text-2xl ml-5 items-center font-sans">
                        {currentArticle.category}
                    </p>
                    <div className="flex flex-col items-end m-5 p-3">
                        <div className="flex gap-1">
                            <p>Published :</p>
                            <p>
                                {currentArticle.createdAt.slice(0, 10)} :
                                {currentArticle.createdAt.slice(11, 16)}
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <p>Last updated :</p>
                            <p>
                                {currentArticle.updatedAt.slice(0, 10)} :
                                {currentArticle.createdAt.slice(11, 16)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col bg-purple-300 mx-18 p-5">
                <p className="font-serif p-5 whitespace-pre-wrap">
                    {currentArticle.content}
                </p>
                <div>
                    <div>
                        <div>
                            {role == "AUTHOR" && (
                                <div className="m-2">
                                    <button
                                        className="border bg-blue-500 rounded px-3 py-2 m-1"
                                        onClick={() =>
                                            navigate(
                                                `/edit-article/${currentArticle._id}`,
                                                {
                                                    state: currentArticle,
                                                },
                                            )
                                        }
                                    >
                                        Edit Article
                                    </button>
                                    <button
                                        className="border bg-red-500 rounded px-3 py-2 m-1"
                                        onClick={deleteArticle}
                                    >
                                        Delete article
                                    </button>
                                </div>
                            )}
                            <p className="text-2xl">Comments:</p>
                            {role == "USER" && (
                                <form onSubmit={handleSubmit(submitComment)}>
                                    <input
                                        type="text"
                                        placeholder="add comment.."
                                        className="border p-2 w-[] rounded w-3xl"
                                        {...register("comment")}
                                    />
                                    <button className="border bg-blue-500">
                                        Add comment
                                    </button>
                                </form>
                            )}
                            {currentArticle.comments.map((e) => (
                                <div key={e._id} className="p-4">
                                    <p>{e.user?.firstName}</p>
                                    <p>{e.comments}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArticleById;

// author
// :
// "69ae92141b905bf3821f53d3"
// category
// :
// "comedy"
// comments
// :
// (2) [{…}, {…}]
// content
// :
// "sdjvbskdjv ksjdvbsdjbv "
// createdAt
// :
// "2026-03-09T15:14:01.902Z"
// isArticleActive
// :
// true
// title
// :
// "Bhalu"
// updatedAt
// :
// "2026-03-09T15:51:18.386Z"
// _id
// :
// "69aee3b90251a40e36443ba3"
