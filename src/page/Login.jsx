import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { message } from "antd";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Sinov uchun qo'lda belgilangan username va parol
    const testUsername = "admin";
    const testPassword = "123456";

    if (username === testUsername && password === testPassword) {
      const fakeToken = "test12345"; // Sinov uchun token
      localStorage.setItem("token", fakeToken); // Tokenni saqlaymiz
     message.success("Login muvafaqqiyatli")
      navigate("/dashboard"); // Dashboard'ga o'tamiz
    } else {
      setError("❌ Login yoki parol noto‘g‘ri!");
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
        <button type="submit" className="login-button">
          🚀 Kirish
        </button>
      </form>
    </div>
  );
};

export default Login;
