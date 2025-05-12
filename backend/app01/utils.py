""" 串接gemini ai api 暫時用不到
import os
from google.oauth2 import service_account
import vertexai
from vertexai.language_models import ChatModel  # ← 改這裡

# —— 载入服务帐号凭证 —— #
SERVICE_ACCOUNT_FILE = r"C:\Users\jay\Downloads\my-project-111707006-003aeeee8529.json"
_CREDENTIALS = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=["https://www.googleapis.com/auth/cloud-platform"],
)

_MODEL = None

def _ensure_initialized():
    global _MODEL
    if _MODEL is None:
        # 用显式凭证初始化
        vertexai.init(
            project="my-project-111707006",
            location="us-central1",
            credentials=_CREDENTIALS
        )
        # 改用 chat-bison 会话模型
        _MODEL = ChatModel.from_pretrained("chat-bison")
    return _MODEL

def ask_gemini(prompt: str) -> str:
    model = _ensure_initialized()
    # 会话模型需要先 start_chat()
    chat = model.start_chat()
    response = chat.send_message(prompt)
    return response.text

def translate_text(text: str) -> str:
    return ask_gemini(f"請將以下內容翻譯成英文：\n{text}")

def summarize_text(text: str) -> str:
    return ask_gemini(f"請為以下筆記產生一段摘要：\n{text}")

def rewrite_text(text: str) -> str:
    return ask_gemini(f"請將下列內容改寫成更專業、簡潔的語氣：\n{text}")
"""