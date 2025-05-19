import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ✅ 設定 API 金鑰
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def call_gemini(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-1.5-flash")  # 不加 models/
    response = model.generate_content(prompt)
    return response.text
