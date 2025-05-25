// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EditPage from './pages/EditPage';
import CategoryPage from './pages/CategoryPage';
import RegisterPage from './pages/RegisterPage';
import NotePage from './pages/NotePage';
import UserQueryPage from './pages/UserQueryPage';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path="/user-query" element={<UserQueryPage />} />
        {/* <Route path="/edit" element={<EditPage />} /> */}
        {/* <Route path="/category" element={<CategoryPage />} /> */}
        <Route path="/note" element={<NotePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
