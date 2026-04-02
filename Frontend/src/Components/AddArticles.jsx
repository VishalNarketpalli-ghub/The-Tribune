import { useState } from "react";
import { useForm } from "react-hook-form";
import { userAuth } from "../Store/authStore";
import axios from "axios";
import { useNavigate } from "react-router";

function AddArticles() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const [error, setError] = useState();
    const [loading, setLoading] = useState();

    const currentUser = userAuth((state) => state.currentUser);
    // console.log(currentUser);

    const createNewArticle = async (data) => {
        // console.log(data);
        const reqData = {
            author: currentUser._id,
            title: data.title,
            category: data.category,
            content: data.content,
        };
        console.log(reqData);

        // make axios req to create article

        const res = await axios.post(
            "http://localhost:4000/author-api/articles",
            reqData,
            { withCredentials: true },
        );

        // console.log(res);

        navigate(`/article/${res.data.payload._id}`);
    };

    if (loading) {
        return <p>Loading</p>;
    }

    return (
        <div className="h-[100%] flex flex-col justify-center items-center">
            <form
                className="border p-5 w-[80%] rounded flex flex-col gap-3 rounded-lg shadow-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white"
                onSubmit={handleSubmit(createNewArticle)}
            >
                {/* title */}
                <div className="flex flex-col">
                    <label>Title</label>
                    <input
                        type="text"
                        placeholder="Title of the blog"
                        className="border rounded m-2 p-2"
                        {...register("title", {
                            required: "Title is required",
                        })}
                    />
                    {errors.title && <p>{errors.title.message}</p>}
                </div>
                {/* category */}

                <div className="flex flex-col">
                    <label>Category</label>
                    <input
                        type="text"
                        placeholder="category of the blog"
                        className="border rounded m-2 p-2"
                        {...register("category", {
                            required: "Category is required",
                        })}
                    />
                    {errors.category && <p>{errors.category.message}</p>}
                </div>

                {/* content */}
                <div className="flex flex-col">
                    <label>Content</label>
                    <textarea
                        rows="18"
                        type="text"
                        placeholder="content of the blog"
                        className=" border rounded m-2 whitespace-pre-wrap"
                        {...register("content", {
                            required: "Content is required",
                        })}
                    />
                    {errors.content && <p>{errors.content.message}</p>}
                </div>
                <button className="bg-green-400 p-2 w-30 rounded">
                    submit
                </button>
            </form>
        </div>
    );
    //  {
    //      "author" : "69afca09faa1f81ee460a067",
    //      "title": "My New World.",
    //      "category" : "Life",
    //      "content" : "example text 2"
    //  }
}

export default AddArticles;
