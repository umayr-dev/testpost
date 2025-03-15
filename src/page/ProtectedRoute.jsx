import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // 🔑 Tokenni olish

  if (!token) {
    return <Navigate to="/login" replace />; // 🔥 Token yo‘q bo‘lsa, login sahifasiga o‘tadi
  }

  return children;
};

export default ProtectedRoute;
