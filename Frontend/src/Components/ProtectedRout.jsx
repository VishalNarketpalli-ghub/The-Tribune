import { Navigate } from "react-router";
import { userAuth } from "../Store/authStore";

/**
 * ProtectedRout — guards a route based on authentication state and user role.
 *
 * Check order matters:
 *   1. If the auth check is still in-flight (initial page load), show a
 *      loading indicator so we do not prematurely redirect to /login.
 *   2. Once loading is done, redirect unauthenticated visitors to /login.
 *   3. If a required role list is provided, redirect users whose role is not
 *      in that list back to /login.
 *   4. If all checks pass, render the protected child component.
 *
 * Props:
 *   children     — the component tree to render when access is granted
 *   allowedRoles — optional array of role strings that are permitted
 */
function ProtectedRout({ children, allowedRoles }) {
    const { loading, currentUser, isAuthenticated } = userAuth();

    // Step 1: Auth check is still running — do not redirect yet.
    // Without this guard, on a fresh page load the store starts with
    // isAuthenticated = false and would instantly bounce the user to /login
    // before checkAuth() has had a chance to restore the session from the cookie.
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-7 h-7 border-[3px] border-[#C4590A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Step 2: User is not authenticated — send to login page.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Step 3: Route requires a specific role; verify the current user has it.
    if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
        return <Navigate to="/login" replace />;
    }

    // Step 4: All checks passed — render the intended page.
    return children;
}

export default ProtectedRout;
