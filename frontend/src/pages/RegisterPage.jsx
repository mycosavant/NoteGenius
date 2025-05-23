import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');  // 👈 加上錯誤訊息狀態

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // 清除舊錯誤

    if (email.trim() === "" || password.trim() === "" || username.trim() === "") {
      setError("Please enter email, password and username");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // 解析 DRF 錯誤格式
        const errorMessages = [];
        for (const field in errorData) {
          if (Array.isArray(errorData[field])) {
            errorMessages.push(`${field}: ${errorData[field].join(", ")}`);
          } else {
            errorMessages.push(`${field}: ${errorData[field]}`);
          }
        }

        setError("註冊失敗：\n" + errorMessages.join("\n"));
        return;
      }

      const data = await response.json();
      console.log("✅ 註冊成功：", data);
      navigate("/note");
    } catch (error) {
      console.error("❌ 錯誤：", error);
      setError("發生錯誤，請稍後再試");
    }
  };

  return (
    <div className="Register-container">
      <div>
        <h1>NoteGenius</h1>
        <div className="Register-form-box" id="register-form">
          <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="error-message" style={{ color: "red", marginTop: "10px", whiteSpace: "pre-line" }}>
                {error}
              </div>
            )}

            <button type="submit" name="register" id="register-button">Register</button>

            <p>
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
              >
                Login
              </a>
            </p>
            <p>
              Want to query your account?{" "}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  navigate("/user-query");
                }}
                style={{ color: "#7494ec", textDecoration: "underline" }}
              >
                Inquiry
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
