import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./Components/RootLayout";
import Home from "./Components/Home";
import Register from "./Components/Register";
import Login from "./Components/Login";
import UserProfile from "./Components/UserProfile";
import AuthorProfile from "./Components/AuthorProfile";
import { Toaster } from "react-hot-toast";
import ArticleById from "./Components/ArticleById";
import ProtectedRout from "./Components/ProtectedRout";
import ErrorBoundary from "./Components/ErrorBoundary";
import AddArticles from "./Components/AddArticles";
import EditArticle from "./Components/EditArticle";
import AdminProfile from "./Components/AdminProfile";
import Articles from "./Components/Articles";
import ArticlesOfAuthor from "./Components/ArticlesOfAuthor";

/**
 * App.jsx — root component that defines the entire client-side route tree.
 *
 * Route access model:
 *   Public  : /  /register  /login
 *   USER    : /user-profile  /article/:id  /articles  /articles/author/:authorId
 *   AUTHOR  : /author-profile  /article/:id  /add-articles  /edit-article/:id
 *   ADMIN   : /admin-profile
 *
 * ProtectedRout checks loading → isAuthenticated → role in that order
 * so the app never bounces to /login during the initial cookie-restore.
 */
function App() {
    const routerObj = createBrowserRouter([
        {
            path: "/",
            element: <RootLayout />,
            // ErrorBoundary catches unexpected JS errors thrown inside any child route
            errorElement: <ErrorBoundary />,
            children: [
                {
                    // Landing / marketing page — visible to everyone
                    path: "",
                    element: <Home />,
                },
                {
                    // Public registration page
                    path: "register",
                    element: <Register />,
                },
                {
                    // Public login page — handles USER, AUTHOR and ADMIN roles
                    path: "login",
                    element: <Login />,
                },
                {
                    // Browse all published articles — accessible to both USER and AUTHOR
                    path: "articles",
                    element: (
                        <ProtectedRout allowedRoles={["USER", "AUTHOR", "ADMIN"]}>
                            <Articles />
                        </ProtectedRout>
                    ),
                },
                {
                    // Public author article listing — view articles by a specific author
                    path: "articles/author/:authorId",
                    element: (
                        <ProtectedRout allowedRoles={["USER", "AUTHOR", "ADMIN"]}>
                            <ArticlesOfAuthor />
                        </ProtectedRout>
                    ),
                },
                {
                    // Individual article reader page — USER and AUTHOR can read
                    path: "article/:articleId",
                    element: (
                        <ProtectedRout allowedRoles={["AUTHOR", "USER", "ADMIN"]}>
                            <ArticleById />
                        </ProtectedRout>
                    ),
                },
                {
                    // Reader's personal feed and account settings
                    path: "user-profile",
                    element: (
                        <ProtectedRout allowedRoles={["USER"]}>
                            <UserProfile />
                        </ProtectedRout>
                    ),
                },
                {
                    // Author dashboard — article management
                    path: "author-profile",
                    element: (
                        <ProtectedRout allowedRoles={["AUTHOR"]}>
                            <AuthorProfile />
                        </ProtectedRout>
                    ),
                },
                {
                    // Article creation form — AUTHOR only
                    path: "add-articles",
                    element: (
                        <ProtectedRout allowedRoles={["AUTHOR"]}>
                            <AddArticles />
                        </ProtectedRout>
                    ),
                },
                {
                    // Article editing form — AUTHOR only
                    path: "edit-article/:articleId",
                    element: (
                        <ProtectedRout allowedRoles={["AUTHOR"]}>
                            <EditArticle />
                        </ProtectedRout>
                    ),
                },
                {
                    // Admin dashboard — user and article management
                    path: "admin-profile",
                    element: (
                        <ProtectedRout allowedRoles={["ADMIN"]}>
                            <AdminProfile />
                        </ProtectedRout>
                    ),
                },
            ],
        },
    ]);

    return (
        <div>
            {/* Global toast notification container — positioned top-center */}
            <Toaster position="top-center" />
            <RouterProvider router={routerObj} />
        </div>
    );
}

export default App;
