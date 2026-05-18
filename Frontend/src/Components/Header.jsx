import { NavLink } from "react-router";
import { userAuth } from "../Store/authStore";

/**
 * Header — sticky top navigation bar shared across every page.
 *
 * Renders different nav items based on authentication and role:
 *   - Unauthenticated : Home | Browse Articles | Register | Sign in
 *   - USER            : Home | Browse Articles | My Feed (with avatar)
 *   - AUTHOR          : Home | Browse Articles | Dashboard (with avatar)
 *   - ADMIN           : Home | Admin Panel (with avatar)
 *
 * The "Browse Articles" link is shown for authenticated users (not guests)
 * because the /articles route is protected and requires a valid session.
 */
function Header() {
    const isAuthenticated = userAuth((state) => state.isAuthenticated);
    const currentUser     = userAuth((state) => state.currentUser);

    // Shared active/inactive class builder for NavLink items
    const navCls = ({ isActive }) =>
        `px-3 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium ${
            isActive
                ? "bg-[#FBF0E6] text-[#C4590A]"
                : "hover:bg-[#F7F3EA] text-[#4A4540] hover:text-[#1C1B18]"
        }`;

    return (
        <header className="sticky top-0 z-50 bg-[#FFFEF9] border-b border-[#E3DDD0]">
            {/* Decorative gradient accent line — mirrors the footer top strip */}
            <div className="h-[3px] bg-gradient-to-r from-[#C4590A] via-[#E8893A] to-[#2D6E6E]" />

            <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
                {/* Brand wordmark — links back to the home page */}
                <NavLink to="" className="group flex items-center gap-2 select-none">
                    <span className="font-display text-xl font-bold text-[#1C1B18] italic group-hover:text-[#C4590A] transition-colors duration-200">
                        The Tribune
                    </span>
                </NavLink>

                {/* Main navigation links */}
                <nav>
                    <ul className="flex items-center gap-1">

                        {/* Home — always visible */}
                        <li>
                            <NavLink to="" end className={navCls}>
                                Home
                            </NavLink>
                        </li>

                        {/* Browse Articles — only shown to authenticated users since /articles is protected */}
                        {isAuthenticated && (
                            <li>
                                <NavLink to="/articles" className={navCls}>
                                    Articles
                                </NavLink>
                            </li>
                        )}

                        {/* Guest-only links: Register and Sign in */}
                        {!isAuthenticated && (
                            <>
                                <li>
                                    <NavLink to="/register" className={navCls}>
                                        Register
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) =>
                                            `ml-1 px-4 py-1.5 rounded-md font-semibold transition-all duration-150 text-sm ${
                                                isActive
                                                    ? "bg-[#C4590A] text-white"
                                                    : "bg-[#1C1B18] text-[#FFFEF9] hover:bg-[#C4590A]"
                                            }`
                                        }
                                    >
                                        Sign in
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* USER: link to reader feed */}
                        {isAuthenticated && currentUser?.role === "USER" && (
                            <li>
                                <NavLink
                                    to="/user-profile"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium ${
                                            isActive
                                                ? "bg-[#FBF0E6] text-[#C4590A]"
                                                : "hover:bg-[#F7F3EA] text-[#4A4540] hover:text-[#1C1B18]"
                                        }`
                                    }
                                >
                                    {/* Avatar initial */}
                                    <span className="w-6 h-6 rounded-full bg-[#C4590A] text-white flex items-center justify-center text-xs font-bold">
                                        {currentUser?.firstName?.[0]?.toUpperCase()}
                                    </span>
                                    My Feed
                                </NavLink>
                            </li>
                        )}

                        {/* AUTHOR: link to author dashboard */}
                        {isAuthenticated && currentUser?.role === "AUTHOR" && (
                            <li>
                                <NavLink
                                    to="/author-profile"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium ${
                                            isActive
                                                ? "bg-[#FBF0E6] text-[#C4590A]"
                                                : "hover:bg-[#F7F3EA] text-[#4A4540] hover:text-[#1C1B18]"
                                        }`
                                    }
                                >
                                    <span className="w-6 h-6 rounded-full bg-[#2D6E6E] text-white flex items-center justify-center text-xs font-bold">
                                        {currentUser?.firstName?.[0]?.toUpperCase()}
                                    </span>
                                    Dashboard
                                </NavLink>
                            </li>
                        )}

                        {/* ADMIN: link to admin control panel */}
                        {isAuthenticated && currentUser?.role === "ADMIN" && (
                            <li>
                                <NavLink
                                    to="/admin-profile"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium ${
                                            isActive
                                                ? "bg-[#FBF0E6] text-[#C4590A]"
                                                : "hover:bg-[#F7F3EA] text-[#4A4540] hover:text-[#1C1B18]"
                                        }`
                                    }
                                >
                                    <span className="w-6 h-6 rounded-full bg-[#1C1B18] text-white flex items-center justify-center text-xs font-bold">
                                        {currentUser?.firstName?.[0]?.toUpperCase()}
                                    </span>
                                    Admin Panel
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
