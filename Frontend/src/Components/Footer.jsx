import { NavLink } from "react-router";

/**
 * Footer — site-wide footer rendered by RootLayout below every page.
 *
 * Sections:
 *   - Brand column: logo, tagline, brief mission statement
 *   - Navigate column: primary site links
 *   - Join column: role-specific registration prompts
 *   - Bottom bar: copyright
 *
 * The footer intentionally keeps navigation minimal; it is a secondary
 * wayfinding element and should not compete with the header.
 */
function Footer() {
    const year = new Date().getFullYear();

    const navLinks = [
        { to: "/",        label: "Home" },
        { to: "/articles", label: "Browse Articles" },
        { to: "/register", label: "Register" },
        { to: "/login",    label: "Sign in" },
    ];

    return (
        <footer className="bg-[#1C1B18] text-[#C8C0B0]">
            {/* Accent line at the very top of the footer for visual continuity */}
            <div className="h-[3px] bg-gradient-to-r from-[#C4590A] via-[#E8893A] to-[#2D6E6E]" />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

                    {/* Brand column */}
                    <div className="flex flex-col gap-3">
                        <p className="font-display italic text-[#C4590A] text-2xl font-bold">
                            The Tribune
                        </p>
                        <p className="font-serif text-sm leading-relaxed text-[#7A736A]">
                            A curated editorial platform for thoughtful long-form writing
                            on culture, technology and ideas that matter.
                        </p>
                    </div>

                    {/* Navigation column */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-widest font-semibold text-[#4A4540] mb-1">
                            Navigate
                        </p>
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="text-sm text-[#C8C0B0] hover:text-[#C4590A] transition-colors duration-150"
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Join column */}
                    <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-widest font-semibold text-[#4A4540] mb-1">
                            Join us
                        </p>
                        <p className="text-sm leading-relaxed text-[#7A736A]">
                            Read as a <NavLink to="/register" className="text-[#C4590A] hover:underline underline-offset-2">Reader</NavLink> or
                            {" "}write as an <NavLink to="/register" className="text-[#C4590A] hover:underline underline-offset-2">Author</NavLink>.
                        </p>
                        <p className="text-xs text-[#4A4540]">
                            Admin access is granted by the platform team only.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom copyright bar */}
            <div className="border-t border-[#2D2C28]">
                <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-[#4A4540]">
                        &copy; {year} The Tribune. All rights reserved.
                    </p>
                    <p className="text-xs text-[#4A4540]">
                        Words worth reading.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;