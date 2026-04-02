import { useEffect, useState } from "react";
import { userAuth } from "../Store/authStore";
import { useNavigate } from "react-router";
import axios from "axios";

function AuthorProfile() {
    // store logout from userAuth
    const logout = userAuth((state) => state.logout);
    const currentUser = userAuth((state) => state.currentUser);
    // console.log(currentUser);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [articleObj, setArticleObj] = useState([]);
    // console.log(articleObj);

    // create on logout functionality
    const onLogout = async () => {
        logout();

        // useNavigate to login page aftetr implimenting logout
        navigate("/login");
    };

    const viewArticle = (currentArticle) => {
        navigate(`/article/${currentArticle._id}`, {
            state: currentArticle,
        });
    };

    const RestoreArticle = async (currentArticle) => {
        // console.log(currentArticle);

        // make a backend call and restore the article
        const res = await axios.put(
            "http://localhost:4000/author-api/article-reload",
            {
                authorId: currentArticle.author._id,
                articleId: currentArticle._id,
            },
            { withCredentials: true },
        );
        // console.log(res.data.payload);
    };

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            const res = await axios.get(
                `http://localhost:4000/author-api/articles/${currentUser._id}`,
                { withCredentials: true },
            );
            // console.log(res);
            setArticleObj(res.data.payload);
        };
        fetchArticles();
        setLoading(false);
    }, [articleObj]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {/* buttons of logout and add article */}
            <div className="flex flex-row justify-end">
                {/* Create new Article button */}
                <button
                    onClick={() => navigate("/add-articles")}
                    className="items-end border rounded px-3 m-3 p-3 pointer bg-green-500 hover:opacity-70 cursor-pointer"
                >
                    Create Article +
                </button>
                <button
                    onClick={onLogout}
                    className="items-end border rounded px-3 m-3 pointer bg-red-500 hover:opacity-70 cursor-pointer"
                >
                    Logout
                </button>
            </div>
            {/* display all articles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-white">
                {articleObj?.map((e) => (
                    <div
                        key={e._id}
                        className="border m-2 p-4 flex justify-between bg-gray-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-black hover:border-orange-700"
                    >
                        <div>
                            <p className="font-semibold">Title: {e.title}</p>
                            <p>Auhor: {e.author.firstName}</p>
                            <p>Category: {e.category}</p>
                            <button
                                onClick={() => viewArticle(e)}
                                className="text-blue-300 cursor-pointer "
                            >
                                View Article
                            </button>
                        </div>
                        {e.isArticleActive && (
                            <div>
                                <button className="bg-green-500 px-1 rounded">
                                    Active
                                </button>
                            </div>
                        )}
                        {!e.isArticleActive && (
                            <div>
                                <button
                                    className="bg-blue-600 px-1 rounded cursor-pointer"
                                    onClick={() => RestoreArticle(e)}
                                >
                                    Restore
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AuthorProfile;
