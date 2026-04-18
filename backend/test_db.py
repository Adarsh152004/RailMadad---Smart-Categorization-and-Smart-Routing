import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUB_URL = os.getenv("SUPABASE_URL")
SUB_KEY = os.getenv("SUPABASE_KEY")

print(f"URL: {SUB_URL}")
try:
    supabase: Client = create_client(SUB_URL, SUB_KEY)
    res = supabase.table("complaints").select("*").limit(1).execute()
    print("✅ Supabase Connection Successful!")
    print(f"Data: {res.data}")
except Exception as e:
    print(f"❌ Connection Failed: {e}")
