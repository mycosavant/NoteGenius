# utils.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
from .models import *

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def build_chat_prompt(user_input: str, note_content: str) -> str:
    return ("你是一個專業的中文語言助手，能夠協助使用者翻譯、改寫、摘要筆記內容。\n"
            "請依照使用者指示進行操作。\n\n"
            f"使用者的指令：{user_input}\n\n"
            f"以下是使用者的筆記內容（請保留段落格式）：\n```text\n{note_content}\n```")


def call_gemini(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text


def handle_ai_chat(user_id: int, prompt: str, note_id: int) -> dict:
    if not prompt:
        return {"error": "請提供 prompt 文字", "status": 400}

    if not note_id:
        return {"error": "請提供 note_id", "status": 400}

    try:
        note = Note.objects.get(id=note_id, user_id=user_id)
    except Note.DoesNotExist:
        return {"error": "找不到對應的筆記或您無權限查看此筆記", "status": 404}

    full_prompt = build_chat_prompt(prompt, note.content)

    try:
        result = call_gemini(full_prompt)
    except Exception as e:
        return {"error": f"Gemini 呼叫失敗：{str(e)}", "status": 500}

    return {
        "note_id": note.id,
        "note_title": note.title,  # ✅ 加入這一行
        "prompt": prompt,
        "result": result,
        "status": 200
    }
