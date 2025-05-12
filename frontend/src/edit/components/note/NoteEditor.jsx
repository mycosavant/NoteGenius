// src/components/note/NoteEditor.jsx
import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import './NoteEditor.css';

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  initialCategory,
  initialTags = [],
  categories,
  onSave,
  onCreateCategory,
}) {
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 自動保存
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (noteId && (title !== initialTitle || content !== initialContent)) {
        saveNote();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [title, content]);

  // 手動保存筆記
  const saveNote = () => {
    if (!noteId) return;

    setIsSaving(true);
    onSave(noteId, title, content, category, tags);

    // 顯示保存成功指示器
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      // 3秒後隱藏成功指示器
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 500);
  };

  // 添加標籤
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  // 移除標籤
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  if (!noteId) {
    return <div className="note-editor-placeholder">請選擇或創建一個筆記</div>;
  }

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="筆記標題"
          className="note-title-input"
        />
      </div>

      <div className="note-editor-toolbar">
        <div className="note-editor-tabs">
          <button
            className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            編輯
          </button>
          <button
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            預覽
          </button>
          <button
            className={`tab-button ${activeTab === 'split' ? 'active' : ''}`}
            onClick={() => setActiveTab('split')}
          >
            分割視圖
          </button>
        </div>
        <Button
          onClick={saveNote}
          disabled={isSaving}
          className="save-button"
        >
          {isSaving ? '保存中...' : saveSuccess ? '已保存' : '保存'}
        </Button>
      </div>

      {/* 分類和標籤區域 */}
      <div className="note-metadata">
        <div className="category-selector">
          <span>分類:</span>
          <select
            value={category || ''}
            onChange={(e) => setCategory(e.target.value || undefined)}
          >
            <option value="">無分類</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const newCategory = prompt('請輸入新分類名稱:');
              if (newCategory && !categories.includes(newCategory)) {
                onCreateCategory(newCategory);
                setCategory(newCategory);
              }
            }}
            className="add-category-button"
          >
            +
          </button>
        </div>

        <div className="tags-container">
          <span>標籤:</span>
          <div className="tags-list">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button onClick={() => removeTag(tag)} className="remove-tag">
                  ×
                </button>
              </span>
            ))}
            <div className="add-tag">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="新增標籤"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button onClick={addTag}>+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="note-editor-content">
        {activeTab === 'edit' && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={content}
            onChange={(value) => setContent(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'off',
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
        )}

        {activeTab === 'preview' && (
          <div className="markdown-preview">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === 'split' && (
          <div className="split-view">
            <div className="editor-pane">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                value={content}
                onChange={(value) => setContent(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  lineNumbers: 'off',
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            <div className="preview-pane">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}