import React, { useState, useEffect } from "react";
import "./RegisterPage.css";

function UserQueryPage() {
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  // 一進來自動填入 input
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.account) setAccount(user.account);
    if (user.username) setUsername(user.username);
    if (user.password) setPassword(user.password);
  }, []);

  const handleQuery = (e) => {
    e.preventDefault();
    if (account.trim() === "" || password.trim() === "" || username.trim() === "") {
      alert("Please enter account, password and username");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (
      user.account === account &&
      user.username === username &&
      user.password === password
    ) {
      setQueryResult(user);
    } else {
      setQueryResult("No user found or information does not match");
    }
  };

  return (
    <div className="Register-container">
      <div>
        <h1>NoteGenius</h1>
        <div className="Register-form-box" id="register-form">
          <form onSubmit={handleQuery}>
            <h2>Account Inquiry</h2>
            <input
              type="text"
              name="account"
              placeholder="Account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" id="register-button">Query</button>
          </form>
          {queryResult && (
            <div style={{ marginTop: 20, background: "#f5f9ff", padding: 16, borderRadius: 6 }}>
              {typeof queryResult === "string" ? (
                <span style={{ color: "#e54d42" }}>{queryResult}</span>
              ) : (
                <>
                  <div><b>Account:</b> {queryResult.account}</div>
                  <div><b>Username:</b> {queryResult.username}</div>
                  <div><b>Password:</b> {queryResult.password}</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserQueryPage;
