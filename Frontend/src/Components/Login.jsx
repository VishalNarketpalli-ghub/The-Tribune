import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { userAuth } from "../Store/authStore";
import { useNavigate, NavLink } from "react-router";
import toast from "react-hot-toast";

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [loading, setLoading] = useState(false);
    const login = userAuth((state) => state.login);
    const isAuthenticated = userAuth((state) => state.isAuthenticated);
    const currentUser = userAuth((state) => state.currentUser);
    const navigate = useNavigate();
    const error = userAuth((state) => state.error);

    const onUserLogin = async (userCredObj) => {
        await login(userCredObj);
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (currentUser.role === "USER") {
                toast.success("Logged in successfully");
                navigate("/user-profile");
            }
            if (currentUser.role === "AUTHOR") {
                toast.success("Logged in successfully");
                navigate("/author-profile");
            }
        }
    }, [isAuthenticated, currentUser]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9] flex items-center justify-center px-4 py-16">
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-[#E3DDD0]">

                {/* Coloured top strip */}
                <div className="h-2 bg-gradient-to-r from-[#C4590A] via-[#E8893A] to-[#2D6E6E]" />

                <div className="px-10 pt-10 pb-12">
                    {/* Heading */}
                    <div className="mb-8 text-center">
                        <p className="font-display italic text-[#C4590A] text-3xl font-bold mb-1">
                            The Tribune
                        </p>
                        <p className="text-sm text-[#7A736A] font-sans">
                            Sign in to continue reading
                        </p>
                    </div>

                    {/* Backend error */}
                    {currentUser?.message === "error" && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {currentUser.reason}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onUserLogin)} className="flex flex-col gap-5">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-[#7A736A] font-semibold">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email", { required: "Email is required" })}
                                className="border border-[#E3DDD0] bg-[#FFFEF9] rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs uppercase tracking-widest text-[#7A736A] font-semibold">
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Minimum 6 characters" },
                                })}
                                className="border border-[#E3DDD0] bg-[#FFFEF9] rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all"
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            className="mt-1 w-full bg-[#C4590A] hover:bg-[#9E4407] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer"
                        >
                            Sign in
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[#7A736A]">
                        Don't have an account?{" "}
                        <NavLink
                            to="/register"
                            className="text-[#C4590A] font-semibold hover:underline underline-offset-2 transition-all"
                        >
                            Register
                        </NavLink>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
