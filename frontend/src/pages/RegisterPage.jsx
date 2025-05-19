import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (account.trim() === "" || password.trim() === "" || username.trim() === "") {
      alert("請輸入帳號、密碼和姓名");
      return;
    }
    // 儲存到 localStorage (demo 用)
    localStorage.setItem("user", JSON.stringify({ account, password, username }));
    // 註冊完自動跳轉
    navigate("/category");
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
              name="account"
              placeholder="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
            <input
              type="text"
              name="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" name="register" id='register-button'>Register</button>
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
