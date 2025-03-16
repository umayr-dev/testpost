import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import "../index.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/channel");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("https://testpost.uz/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username); // Username saqlash
        message.success("Login muvaffaqiyatli");
        navigate("/channel");
      } else {
        setError("❌ Login yoki parol noto‘g‘ri!");
      }
    } catch (error) {
      setError("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>🔐 Kirish</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="👤 Username"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="🔑 Parol"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "⏳ Yuklanmoqda..." : "🚀 Kirish"}
        </button>
      </form>
    </div>
  );
};

export default Login;