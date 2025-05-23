import { useState } from "react";
import "./RegisterPage.css";

function UserQueryPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (username.trim() === "" || email.trim() === "") {
      alert("Please enter both username and email");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/users/query-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setQueryResult(data.error || "Error occurred while querying");
      } else {
        setQueryResult(data); // 正確的使用者資料
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setQueryResult("Error occurred while querying");
    }
  };

  return (
    <div className="Register-container">
      <div>
        <h1>NoteGenius</h1>
        <div className="Register-form-box" id="register-form">
          <form onSubmit={handleQuery}>
            <h2>Password Lookup</h2>
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
            <button type="submit" id="register-button">Query</button>
            <p>
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/";
                }}
                style={{ color: "#7494ec", textDecoration: "underline" }}
              >
                Login
              </a>
            </p>

            <p style={{ marginTop: "16px" }}>
              Don’t have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/register";
                }}
                style={{ color: "#7494ec", textDecoration: "underline" }}
              >
                Register
              </a>
            </p>


          </form>

          {queryResult && (
            <div style={{ marginTop: 20, background: "#f5f9ff", padding: 16, borderRadius: 6 }}>
              {typeof queryResult === "string" ? (
                <span style={{ color: "#e54d42" }}>{queryResult}</span>
              ) : (
                <>
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
