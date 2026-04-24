import { Navigate, useLocation } from "react-router-dom";

import useAuthStore from "../store/authStore.js";

function AdminRoute({ children }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}

export default AdminRoute;
