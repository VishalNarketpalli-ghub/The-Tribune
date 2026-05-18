import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { userAuth } from "../Store/authStore";
import { useNavigate, NavLink } from "react-router";
import toast from "react-hot-toast";

/**
 * Login — authentication page shared by all roles (USER, AUTHOR, ADMIN).
 *
 * Flow:
 *   1. User submits email + password.
 *   2. The Zustand login action calls the backend and updates global auth state.
 *   3. The useEffect watches isAuthenticated; once true it reads the role and
 *      redirects each role to its own home screen.
 *   4. Backend errors (wrong email/password, blocked account) are surfaced
 *      via the error field in the auth store.
 */
function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const login          = userAuth((state) => state.login);
    const isAuthenticated = userAuth((state) => state.isAuthenticated);
    const currentUser    = userAuth((state) => state.currentUser);
    const authError      = userAuth((state) => state.error);
    const loading        = userAuth((state) => state.loading);
    const navigate       = useNavigate();

    // Submit the credentials to the auth store action
    const onUserLogin = async (userCredObj) => {
        await login(userCredObj);
    };

    // After the store updates authentication, redirect to the correct dashboard
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            toast.success("Logged in successfully");
            if (currentUser.role === "USER")   navigate("/user-profile");
            if (currentUser.role === "AUTHOR") navigate("/author-profile");
            if (currentUser.role === "ADMIN")  navigate("/admin-profile");
        }
    }, [isAuthenticated, currentUser]);

    // Show a spinner while the login request is in-flight
    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9] flex items-center justify-center px-4 py-16">
            {/* Login card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-[#E3DDD0]">

                {/* Decorative gradient strip that matches the brand palette */}
                <div className="h-2 bg-gradient-to-r from-[#C4590A] via-[#E8893A] to-[#2D6E6E]" />

                <div className="px-10 pt-10 pb-12">
                    {/* Brand heading */}
                    <div className="mb-8 text-center">
                        <p className="font-display italic text-[#C4590A] text-3xl font-bold mb-1">
                            The Tribune
                        </p>
                        <p className="text-sm text-[#7A736A] font-sans">
                            Sign in to continue reading
                        </p>
                    </div>

                    {/* Backend / auth error displayed below the heading */}
                    {authError && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {authError}
                        </div>
                    )}

                    {/* Also surface the "message: error" pattern from the store */}
                    {currentUser?.message === "error" && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {currentUser.reason}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onUserLogin)} className="flex flex-col gap-5">
                        {/* Email field */}
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

                        {/* Password field */}
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

                        {/* Submit button */}
                        <button
                            id="login-submit"
                            type="submit"
                            className="mt-1 w-full bg-[#C4590A] hover:bg-[#9E4407] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer"
                        >
                            Sign in
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-[#7A736A]">
                        Don&apos;t have an account?{" "}
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
