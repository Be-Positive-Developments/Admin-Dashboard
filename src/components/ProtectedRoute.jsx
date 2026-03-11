import { Navigate, Outlet } from "react-router";
import { isAuthenticated as checkAuth } from "@/lib/sessionManager";

/**
 * Wraps all protected dashboard routes.
 * If there is no JWT token the user is redirected to /login
 * immediately — the protected content is never rendered.
 *
 * Usage in routes.jsx:
 *   { Component: ProtectedRoute, children: [...dashboard routes] }
 */
export default function ProtectedRoute() {
  if (!checkAuth()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
