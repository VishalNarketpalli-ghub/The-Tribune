import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, NavLink } from "react-router";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Register — public registration form for new USER and AUTHOR accounts.
 *
 * Admin accounts are intentionally excluded from this form.
 * Admins are created by developers using the seed script at
 * Backend/scripts/createAdmin.js — this prevents privilege escalation
 * through the public-facing API.
 *
 * Flow:
 *   1. User selects a role (Reader or Author) and fills in the form.
 *   2. On submit, the form data is packaged as FormData to support the
 *      optional profile image upload.
 *   3. The request is routed to the correct API based on the selected role.
 *   4. On success (201), the user is redirected to /login.
 */
function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [preview, setPreview] = useState(null);

    const onSubmit = async (newUser) => {
        setLoading(true);
        setError(null);

        // Separate role from the rest of the fields before building FormData
        const { role, profileImageUrl, ...userFields } = newUser;
        const formData = new FormData();

        // Append all plain text fields to the FormData object
        Object.keys(userFields).forEach((key) => formData.append(key, userFields[key]));

        // Append the actual file object if the user selected one
        if (profileImageUrl?.[0]) {
            formData.append("profileImageUrl", profileImageUrl[0]);
        }

        try {
            let resObj;
            const baseUrl = import.meta.env.VITE_API_URL;
            if (role === "AUTHOR") {
                resObj = await axios.post(`${baseUrl}/author-api/users`, formData);
            }
            if (role === "USER") {
                resObj = await axios.post(`${baseUrl}/user-api/users`, formData);
            }

            if (resObj?.status === 201) {
                toast.success("Account created! Please sign in.");
                navigate("/login");
            }
        } catch (err) {
            setError(err?.response?.data?.error || err?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // Clean up the temporary blob URL when the component unmounts to avoid memory leaks
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setError("Only JPG or PNG allowed");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("File size must be less than 2 MB");
            return;
        }

        // Revoke the old preview URL before creating a new one
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
        setError(null);
    };

    const inputCls =
        "border border-[#E3DDD0] bg-white rounded-lg px-4 py-2.5 text-sm text-[#1C1B18] placeholder-[#C8C0B0] focus:outline-none focus:border-[#C4590A] focus:ring-2 focus:ring-[#C4590A]/15 transition-all w-full";
    const labelCls = "text-xs uppercase tracking-widest text-[#7A736A] font-semibold";
    const errCls   = "text-xs text-red-500 mt-0.5";

    return (
        <div className="min-h-[80vh] bg-[#FFFEF9] flex items-start justify-center px-4 py-14">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-[#E3DDD0]">

                {/* Decorative gradient strip */}
                <div className="h-2 bg-gradient-to-r from-[#C4590A] via-[#E8893A] to-[#2D6E6E]" />

                <div className="px-10 pt-10 pb-12">
                    {/* Brand heading */}
                    <div className="mb-8 text-center">
                        <p className="font-display italic text-[#C4590A] text-2xl font-bold mb-1">
                            The Tribune
                        </p>
                        <p className="text-sm text-[#7A736A]">Create your account</p>
                    </div>

                    {/* Server-side or client-side error message */}
                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        {/* Role selection — determines which API endpoint to call */}
                        <div>
                            <p className={`${labelCls} mb-2`}>I am a</p>
                            <div className="flex gap-3">
                                {[
                                    { value: "USER",   label: "Reader",  desc: "Browse & comment" },
                                    { value: "AUTHOR", label: "Author",  desc: "Write & publish" },
                                ].map((r) => (
                                    <label
                                        key={r.value}
                                        className="flex-1 flex flex-col items-center gap-1 border border-[#E3DDD0] rounded-xl py-3 px-2 cursor-pointer hover:border-[#C4590A] hover:bg-[#FBF0E6] transition-all text-center has-[:checked]:border-[#C4590A] has-[:checked]:bg-[#FBF0E6]"
                                    >
                                        <input
                                            type="radio"
                                            value={r.value}
                                            {...register("role", { required: "Please select a role" })}
                                            className="accent-[#C4590A] sr-only"
                                        />
                                        <span className="text-sm font-semibold text-[#1C1B18]">{r.label}</span>
                                        <span className="text-xs text-[#7A736A]">{r.desc}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.role && <p className={errCls}>{errors.role.message}</p>}
                        </div>

                        {/* First name + Last name side by side */}
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

                        {/* Profile photo — optional */}
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Profile photo <span className="normal-case text-[#C8C0B0] font-normal">(optional)</span></label>
                            <input
                                id="reg-profile-img"
                                type="file"
                                accept="image/png, image/jpeg"
                                {...register("profileImageUrl")}
                                onChange={handleImageChange}
                                className="text-sm text-[#4A4540] file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-[#E3DDD0] file:bg-[#F7F3EA] file:text-[#4A4540] file:text-xs file:cursor-pointer hover:file:border-[#C4590A] hover:file:text-[#C4590A] transition-colors cursor-pointer"
                            />
                            {/* Image preview shown once a valid file is selected */}
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
