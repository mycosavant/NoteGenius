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
  initialTag,        // 現在用 tag 傳入
  tags = [],         // 標籤列表
  onSave,
  onCreateTag,       // 新增標籤
}) {
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [tag, setTag] = useState(initialTag || '');
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setTag(initialTag || '');
  }, [initialTag]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (noteId && (title !== initialTitle || content !== initialContent || tag !== initialTag)) {
        saveNote();
      }
    }, 2000);
    return () => clearTimeout(saveTimer);
  }, [title, content, tag]);

  const saveNote = () => {
    if (!noteId) return;
    setIsSaving(true);
    onSave(noteId, title, content, tag);   // 儲存時傳入 tag
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
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
          <button className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>編輯</button>
          <button className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>預覽</button>
          <button className={`tab-button ${activeTab === 'split' ? 'active' : ''}`} onClick={() => setActiveTab('split')}>分割視圖</button>
        </div>
        <Button onClick={saveNote} disabled={isSaving} className="save-button">{isSaving ? '保存中...' : saveSuccess ? '已保存' : '保存'}</Button>
      </div>
      {/* 標籤區域 */}
      <div className="note-metadata">
        <div className="category-selector">
          <span>標籤:</span>
          <select value={tag || ''} onChange={(e) => setTag(e.target.value || '')}>
            <option value="">無標籤</option>
            {tags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const newTagValue = prompt('請輸入新標籤名稱:');
              if (newTagValue && !tags.includes(newTagValue)) {
                onCreateTag(newTagValue);
                setTag(newTagValue);
              }
            }}
            className="add-category-button"
          >+</button>
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
