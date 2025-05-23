import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      alert('請輸入使用者名稱和密碼');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 保留 session
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/note');
      } else {
        alert(data.error || '登入失敗');
      }
    } catch (error) {
      alert('伺服器錯誤，請稍後再試');
      console.error('Login error:', error);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <h1 className="title">NoteGenius</h1>
      <div className="form-group">
        <input
          type="text"
          placeholder="username"
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="button-group">
          <button className="login-btn" onClick={handleLogin}>log in</button>
          <button className="register-btn" onClick={handleRegister}>register</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
