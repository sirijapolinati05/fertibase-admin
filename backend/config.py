import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class Settings:
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
    SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASS = os.getenv("EMAIL_PASS")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

settings = Settings()

if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables")

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
