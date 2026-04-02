import { NavLink } from "react-router";
import { useNavigate } from "react-router";
import { userAuth } from "../Store/authStore";

function Header() {
    const navigate = useNavigate();
    const isAuthenticated = userAuth((state) => state.isAuthenticated);
    const currentUser = userAuth((state) => state.currentUser);

    return (
        <div className="flex bg-[#181228] justify-between items-center gap-3">
            <img
                src="https://s3u.tmimgcdn.com/1600x0/u2388748/6dcaaa34ae3e118af6defbbd184391a9.jpg"
                alt="Logo"
                className="w-18 rounded-[50%]"
            />
            <div>
                <ul className="text-white flex justify-around gap-8 mr-5">
                    <li className="hover:text-orange-500">
                        <NavLink
                            to=""
                            className={({ isActive }) =>
                                isActive ? "text-amber-400 rounded" : ""
                            }
                        >
                            Home
                        </NavLink>
                    </li>
                    {!isAuthenticated && (
                        <li className="hover:text-orange-500">
                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    isActive ? "text-amber-400 rounded" : ""
                                }
                            >
                                Register
                            </NavLink>
                        </li>
                    )}
                    {!isAuthenticated && (
                        <li className="hover:text-orange-500">
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    isActive ? "text-amber-400 rounded" : ""
                                }
                            >
                                Login
                            </NavLink>
                        </li>
                    )}
                    {isAuthenticated && currentUser.role == "USER" && (
                        <li className="hover:text-orange-500">
                            <NavLink
                                to="/user-profile"
                                className={({ isActive }) =>
                                    isActive ? "text-amber-400 rounded" : ""
                                }
                            >
                                Profile
                            </NavLink>
                        </li>
                    )}
                    {isAuthenticated && currentUser.role == "AUTHOR" && (
                        <li className="hover:text-orange-500">
                            <NavLink
                                to="/author-profile"
                                className={({ isActive }) =>
                                    isActive ? "text-amber-400 rounded" : ""
                                }
                            >
                                Profile
                            </NavLink>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Header;
