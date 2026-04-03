import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, NavLink } from "react-router";
import { useEffect, useState } from "react";

function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [preview, setPreview] = useState();

    const onSubmit = async (newUser) => {
        setLoading(true);
        const formData = new FormData();
        let { role, profileImageUrl, ...userObj } = newUser;
        Object.keys(userObj).forEach((key) => formData.append(key, userObj[key]));
        formData.append("profileImageUrl", profileImageUrl[0]);

        try {
            if (role === "AUTHOR") {
                let resObj = await axios.post("http://localhost:4000/author-api/users", formData);
                if (resObj.status == 201) navigate("/login");
            }
            if (role === "USER") {
                let resObj = await axios.post("http://localhost:4000/user-api/users", formData);
                if (resObj.status == 201) navigate("/login");
            }
        } catch (error) {
            setError(error?.response?.data?.error || error?.message || "Registration failed");
        } finally {
            setLoading(false);
        }

        useEffect(() => {
            return () => { if (preview) URL.revokeObjectURL(preview); };
        }, [preview]);
    };

    const inputCls =
        "border border-[#E3DDD0] bg-white rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all w-full";
    const labelCls = "text-xs uppercase tracking-widest text-[#7A736A] font-semibold";
    const errCls   = "text-xs text-red-500 mt-0.5";

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9] flex items-start justify-center px-4 py-14">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-[#E3DDD0]">

                {/* Gradient top strip */}
                <div className="h-2 bg-gradient-to-r from-[#C4590A] via-[#E8893A] to-[#2D6E6E]" />

                <div className="px-10 pt-10 pb-12">
                    {/* Heading */}
                    <div className="mb-8 text-center">
                        <p className="font-display italic text-[#C4590A] text-2xl font-bold mb-1">
                            The Tribune
                        </p>
                        <p className="text-sm text-[#7A736A]">Create your account</p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        {/* Role */}
                        <div>
                            <p className={`${labelCls} mb-2`}>I am a…</p>
                            <div className="flex gap-3">
                                {["USER", "AUTHOR"].map((r) => (
                                    <label
                                        key={r}
                                        className="flex-1 flex items-center justify-center gap-2 border border-[#E3DDD0] rounded-lg py-2.5 cursor-pointer hover:border-[#C4590A] hover:bg-[#FBF0E6] transition-all text-sm text-[#4A4540]"
                                    >
                                        <input
                                            type="radio"
                                            value={r}
                                            {...register("role", { required: "Please select a role" })}
                                            className="accent-[#C4590A]"
                                        />
                                        <span>{r === "USER" ? "Reader" : "Author"}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.role && <p className={errCls}>{errors.role.message}</p>}
                        </div>

                        {/* Name row */}
                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className={labelCls}>First name</label>
                                <input id="reg-first-name" type="text" placeholder="Jane"
                                    {...register("firstName", { required: "Required" })}
                                    className={inputCls} />
                                {errors.firstName && <p className={errCls}>{errors.firstName.message}</p>}
                            </div>
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className={labelCls}>Last name</label>
                                <input id="reg-last-name" type="text" placeholder="Doe"
                                    {...register("lastName", { required: "Required" })}
                                    className={inputCls} />
                                {errors.lastName && <p className={errCls}>{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Email</label>
                            <input id="reg-email" type="email" placeholder="you@example.com"
                                {...register("email", { required: "Email is required" })}
                                className={inputCls} />
                            {errors.email && <p className={errCls}>{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Password</label>
                            <input id="reg-password" type="password" placeholder="Min. 6 characters"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Minimum 6 characters" },
                                })}
                                className={inputCls} />
                            {errors.password && <p className={errCls}>{errors.password.message}</p>}
                        </div>

                        {/* Profile photo */}
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Profile photo</label>
                            <input
                                id="reg-profile-img"
                                type="file"
                                accept="image/png, image/jpeg"
                                {...register("profileImageUrl")}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (!["image/jpeg", "image/png"].includes(file.type)) {
                                            setError("Only JPG or PNG allowed"); return;
                                        }
                                        if (file.size > 2 * 1024 * 1024) {
                                            setError("File size must be less than 2MB"); return;
                                        }
                                        setPreview(URL.createObjectURL(file));
                                        setError(null);
                                    }
                                }}
                                className="text-sm text-[#4A4540] file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-[#E3DDD0] file:bg-[#F7F3EA] file:text-[#4A4540] file:text-xs file:cursor-pointer hover:file:border-[#C4590A] hover:file:text-[#C4590A] transition-colors cursor-pointer"
                            />
                            {preview && (
                                <div className="mt-2 flex items-center gap-3">
                                    <img src={preview} alt="Preview"
                                        className="w-14 h-14 rounded-full object-cover border-2 border-[#C4590A]" />
                                    <span className="text-xs text-[#7A736A]">Profile preview</span>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            id="reg-submit"
                            type="submit"
                            disabled={loading}
                            className="mt-1 w-full bg-[#C4590A] hover:bg-[#9E4407] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating account…" : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[#7A736A]">
                        Already have an account?{" "}
                        <NavLink to="/login"
                            className="text-[#C4590A] font-semibold hover:underline underline-offset-2">
                            Sign in
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
