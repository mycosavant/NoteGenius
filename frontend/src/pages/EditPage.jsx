import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditPage.css';

function EditPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  // 假設 tags 狀態 
  const [tags] = useState([
    { name: "工作" },
    { name: "生活" },
    { name: "學習" }
  ]);
  const [selectedTag, setSelectedTag] = useState('');

  return (
    <div className="edit-container">
      <h1 className="edit-title">編輯筆記 {noteId}</h1>
      <select
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
        style={{ width: "40%", marginBottom: "20px" }}
      >
        <option value="">選擇標籤</option>
        {tags.map(tag => (
          <option key={tag.name} value={tag.name}>{tag.name}</option>
        ))}
      </select>
      <textarea className="edit-textarea" placeholder="在這裡編輯你的筆記內容..." />
      <div className="edit-actions">
        <button className="save-btn">儲存</button>
        <button className="cancel-btn" onClick={() => navigate('/category')}>取消</button>
        <button className="view-btn" onClick={() => navigate(`/note/${noteId}`)}>查看</button>
      </div>
    </div>
  );
}

export default EditPage;