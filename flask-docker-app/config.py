from dotenv import load_dotenv
import os

load_dotenv()

ACCESS_KEY = os.getenv("SERVER_API_KEY")
HOST = os.getenv("DB_HOST") 
NAME = os.getenv("DB_NAME")
USER = os.getenv("DB_USER")
PW = os.getenv("DB_PASSWORD")

CLIENT = os.getenv("VITE_NAVER_LOGIN_CLIENT_ID")
SECRET = os.getenv("NAVER_LOGIN_CLIENT_SECRET")
