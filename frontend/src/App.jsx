import { Navigate, Route, Routes } from "react-router-dom";

import AdminErrorBoundary from "./components/AdminErrorBoundary.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminConsolesPage from "./pages/admin/AdminConsolesPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminPackagesPage from "./pages/admin/AdminPackagesPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminRatesPage from "./pages/admin/AdminRatesPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import useAuthStore from "./store/authStore.js";

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = Boolean(token && user);
  const defaultAuthenticatedRoute = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? defaultAuthenticatedRoute : "/login"} replace />}
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={defaultAuthenticatedRoute} replace /> : <LoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminErrorBoundary>
                <AdminLayout />
              </AdminErrorBoundary>
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="packages" element={<AdminPackagesPage />} />
        <Route path="rates" element={<AdminRatesPage />} />
        <Route path="consoles" element={<AdminConsolesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
