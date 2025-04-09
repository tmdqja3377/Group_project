from dotenv import load_dotenv
import os
import pymysql
import json
from datetime import datetime

load_dotenv()

with open('전국관광지정보표준데이터.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

records = data['records'] # 공공데이터 JSON은 'records' 키 아래에 있음

# MySQL 연결
conn = pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    charset='utf8mb4'
)

cursor = conn.cursor()

for item in records:
    cursor.execute("""
        INSERT INTO tourist_spots (
            name, category, road_address, lot_address, latitude,
            longitude, area, intro, phone, organization, data_date
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        item.get("관광지명"),
        item.get("관광지구분"),
        item.get("소재지도로명주소"),
        item.get("소재지지번주소"),
        float(item["위도"]) if item.get("위도") else None,
        float(item["경도"]) if item.get("경도") else None,
        item.get("면적"),
        item.get("관광지소개"),
        item.get("관리기관전화번호"),
        item.get("관리기관명"),
        datetime.strptime(item["데이터기준일자"], "%Y-%m-%d").date() if item.get("데이터기준일자") else None
    ))

conn.commit()
conn.close()