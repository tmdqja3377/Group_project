# app.py
from flask import Flask, jsonify, request, redirect
import pymysql
from flask_cors import CORS
from config import ACCESS_KEY, HOST, USER, PW, NAME, CLIENT, SECRET
import bcrypt
from mysql.connector.cursor import MySQLCursorDict
import requests
import os
import concurrent.futures
import json
photo_ref_cache = {}
CACHE_FILE = "photo_cache.json"
photo_ref_cache = {}  # 장소명 ➝ photo_reference 캐싱용

preloaded_data = {}

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


# 🔄 서버 시작 시 캐시 로드
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, 'r', encoding='utf-8') as f:
        photo_ref_cache = json.load(f)

# 📝 캐시 저장 함수
def save_cache():
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(photo_ref_cache, f, ensure_ascii=False, indent=2)

# .env 또는 환경변수에서 API 키 불러오기
@app.route('/api/google/proxy-place-details', methods=['GET'])
def proxy_google_place_details():
    place_name = request.args.get('place_name')
    GOOGLE_API_KEY = os.getenv('VITE_GOOGLE_PLACES_API_KEY')
    print(f"현재 GOOGLE_API_KEY:", GOOGLE_API_KEY)
    if not place_name:
        return jsonify({'error': 'Missing place_name parameter'}), 400

    find_place_url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    params = {'input': place_name, 'inputtype': 'textquery', 'fields': 'place_id', 'key': GOOGLE_API_KEY}
    find_res = requests.get(find_place_url, params=params)
    find_data = find_res.json()

    if not find_data.get('candidates'):
        return jsonify({'error': 'Place not found'}), 404

    place_id = find_data['candidates'][0]['place_id']
    details_url = 'https://maps.googleapis.com/maps/api/place/details/json'
    details_params = {'place_id': place_id, 'fields': 'name,rating,reviews,photos','language': 'ko','key': GOOGLE_API_KEY}
    details_res = requests.get(details_url, params=details_params)
    details_data = details_res.json()

    return jsonify(details_data.get('result', {}))

# 연결테스트
@app.route("/api/test")
def test():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        result = cursor.fetchone()
    conn.close()
    return jsonify(result)

# DB 연결 설정
def get_db_connection():
    return pymysql.connect(
        host=HOST,
        user=USER,
        password=PW,
        db=NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

# ✅ API Key 인증용 데코레이터
def require_api_key(f):
    def wrapper(*args, **kwargs):
        key = request.headers.get("x-api-key")
        if key != ACCESS_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__  # Flask 라우터와 호환되게 설정
    return wrapper

#루트경로 처리
@app.route('/')
def home():
    return "<h1>🗺️ AI 여행 API 서버 작동 중!</h1><p>/api/places 엔드포인트로 데이터를 가져올 수 있습니다.</p>"


# 여행지 목록 API
@app.route('/api/places', methods=['GET'])
@require_api_key
def get_places():
    try :
        q = request.args.get('q', '').strip()
        print("🔍 검색어:", q)

        conn = get_db_connection()
        with conn.cursor() as cursor:
            if q:
                print("🔎 필터링 실행 중")
                cursor.execute("""
                    SELECT * FROM tourist_spots
                    WHERE name LIKE %s
                    LIMIT 10
                """, (f"%{q}%",))
            else:
                print("📄 전체 리스트 출력")
                cursor.execute("SELECT * FROM tourist_spots")
            
            data = cursor.fetchall()
        
        conn.close()
        return jsonify(data)
    except Exception as e:
        print("🔥 API ERROR:", e)
        return jsonify({'error': str(e)}), 500

#로그인 기능
@app.route('/api/login', methods=['POST'])
def login():
    print("🔥🔥🔥🔥 login API 함수 진입했음!")
    data = request.get_json()
    userid = data.get('userid')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "SELECT * FROM usertable WHERE userid=%s"
    cursor.execute(sql, (userid,))
    usertable = cursor.fetchone()
    conn.close()
    
    if usertable:
        hashed_password_from_db = usertable['password']

        if bcrypt.checkpw(password.encode('utf-8'), hashed_password_from_db.encode('utf-8')):
            return jsonify({"message": "로그인 성공", "userid": userid})
        else:
            return jsonify({"message": "비밀번호가 틀립니다."}), 401
    else:
        return jsonify({"message": "존재하지 않는 아이디입니다."}), 404
    

# 회원가입 API
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    userid = data['userid']
    username = data['username']
    password = data['password']


    # 비밀번호 해시
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # DB에 삽입
        cursor.execute("INSERT INTO usertable (userid, username, password) VALUES (%s, %s, %s)", (userid, username, hashed_password))
        conn.commit()
        return jsonify({"message": "회원가입 성공!"}), 201
    
    except pymysql.MySQLError as err:    
        return jsonify({"error": str(err)}), 400
    
    finally:
        cursor.close()
        conn.close()


#네이버 로그인기능
@app.route('/api/naver-login', methods=['POST'])
def naver_login():
    data = request.get_json()
    
    naver_id = data.get("id")
    username = data.get("name")


    if not naver_id or not username:
        return jsonify({"error": "Invalid data"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    #이미 가입한 사용자면 로그인만
    cursor.execute("SELECT * FROM usertable WHERE userid = %s", (naver_id,))
    user = cursor.fetchone()

    if not user:
        #가입된 적 없으면 회원가입 (provider를 'naver'로 구분)
        cursor.execute("""
            INSERT INTO usertable (userid, username, password, provider)
            VALUES (%s, %s, %s, %s)
        """, (naver_id, username, '', 'naver'))
        conn.commit()
    
    cursor.close()
    conn.close()

    return jsonify({"message": "네이버 로그인 성공!", "userid": naver_id})


#네이버 callback 기능
@app.route('/naver/callback')
def naver_callback():

    code = request.args.get('code')
    state = request.args.get('state')

    # 네이버 토큰 요청
    token_url = "https://nid.naver.com/oauth2.0/token"
    payload = {
        "grant_type": "authorization_code",
        "client_id": CLIENT,
        "client_secret": SECRET,
        "code": code,
        "state": state
    }

    token_res = requests.post(token_url, params=payload)
    token_json = token_res.json()

    if 'access_token' not in token_json:
        return jsonify({"error": "Failed to get access token"}), 400

    access_token = token_json['access_token']

    # 네이버 사용자 정보 요청
    profile_url = "https://openapi.naver.com/v1/nid/me"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    profile_res = requests.get(profile_url, headers=headers)
    profile_json = profile_res.json()

    if profile_json.get('resultcode') != '00':
        return jsonify({"error": "Failed to get user profile"}), 400

    naver_user = profile_json['response']
    naver_id = naver_user['id']  # 고유 ID
    email = naver_user.get('email')
    name = naver_user.get('name')
    
    if not naver_id or not name:
        return "네이버 프로필 정보 부족", 400

    # 3. DB 저장 또는 로그인
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 이미 가입된 유저인지 확인
        cursor.execute("SELECT * FROM usertable WHERE userid = %s", (naver_id,))
        user = cursor.fetchone()

        if not user:
            # 없으면 회원가입 처리
            cursor.execute("""
                INSERT INTO usertable (userid, username, password, provider)
                VALUES (%s, %s, %s, %s)
            """, (naver_id, name, '', 'naver'))
            conn.commit()

    except Exception as e:
        print("DB 에러:", e)
        return "서버 에러", 500
    finally:
        cursor.close()
        conn.close()

    return redirect(f"http://localhost:5173/login-success?userid={naver_id}&name={name}&email={email}")

#사용자별 플래너 생성
@app.route('/api/planner/create', methods=['POST'])
@require_api_key
def create_planner():
    data = request.get_json()
    user_id = data.get('user_id')
    title = data.get('title')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    travelers = data.get('travelers')
    region_name = data.get('region_name')
    lat = data.get('lat')
    lng = data.get('lng')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO planners (user_id, title, start_date, end_date, travelers, region_name, lat, lng)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, title, start_date, end_date, travelers, region_name, lat, lng))
        conn.commit()
        planner_id = cursor.lastrowid
        return jsonify({'status': 'success', 'planner_id': planner_id})
    except Exception as e:
        print("플래너 생성 실패:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

#마이페이지
@app.route('/api/user-info', methods=['GET'])
@require_api_key
def get_user_info():
    userid = request.args.get('userid')
    if not userid:
        return jsonify({'error': 'userid 파라미터가 필요합니다'}), 400

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT userid, username, profile_image FROM usertable WHERE userid = %s", (userid,))
            user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({'error': '해당 유저를 찾을 수 없습니다'}), 404

        return jsonify(user)
    except Exception as e:
        print("DB 에러:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-delete', methods=['POST'])
@require_api_key
def delete_user():
    data = request.get_json()
    userid = data.get('userid')

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM usertable WHERE userid = %s", (userid,))
        conn.commit()
        conn.close()
        return jsonify({'message': '삭제 성공'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user-update', methods=['POST'])
@require_api_key
def update_user_info():
    data = request.get_json()
    userid = data.get('userid')
    username = data.get('username')  # ✅ 이름 필드 수정
    profile_image = data.get('profileImage')  # ✅ 이미지 추가

    if not userid:
        return jsonify({'error': 'userid는 필수입니다.'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        update_fields = []
        values = []

        if username:
            update_fields.append("username = %s")
            values.append(username)

        if profile_image:
            update_fields.append("profile_image = %s")
            values.append(profile_image)

        if not update_fields:
            return jsonify({'error': '업데이트할 항목이 없습니다.'}), 400

        query = f"UPDATE usertable SET {', '.join(update_fields)} WHERE userid = %s"
        values.append(userid)

        cursor.execute(query, tuple(values))
        conn.commit()
        return jsonify({'message': '사용자 정보가 성공적으로 수정되었습니다.'})
    except Exception as e:
        print("업데이트 에러:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/password-change', methods=['POST'])
@require_api_key
def change_password():
    data = request.get_json()
    userid = data.get('userid')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not userid or not current_password or not new_password:
        return jsonify({'error': '모든 필드가 필요합니다.'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT password FROM usertable WHERE userid = %s", (userid,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': '존재하지 않는 사용자입니다.'}), 404

        hashed_pw = user['password']
        if not bcrypt.checkpw(current_password.encode('utf-8'), hashed_pw.encode('utf-8')):
            return jsonify({'error': '현재 비밀번호가 틀렸습니다.'}), 401

        new_hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE usertable SET password = %s WHERE userid = %s", (new_hashed, userid))
        conn.commit()

        return jsonify({'message': '비밀번호가 성공적으로 변경되었습니다.'})
    except Exception as e:
        print("비밀번호 변경 에러:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/planner/add-item-simple', methods=['POST'])
@require_api_key
def add_planner_item_simple():
    data = request.get_json()
    print(f"받은 데이터:", data)  # 🔥 이거 추가
    
    planner_id = data.get('plannerId')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    spot_name = data.get('spotName')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO planner_items (planner_id, latitude, longitude, spotName)
            VALUES (%s, %s, %s, %s)
        """, (planner_id, latitude, longitude, spot_name))
        conn.commit()
        return jsonify({"message": "플래너 항목이 성공적으로 추가되었습니다!"}), 201
    except Exception as e:
        print(f"플래너 항목 추가 실패:", e)  # 🔥 여기도 로그 꼭
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/planner/delete-item/<int:item_id>', methods=['DELETE'])
@require_api_key
def delete_planner_item(item_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        print(f"item: {item_id}")

        # planner_items 테이블에서 항목 삭제
        cursor.execute("DELETE FROM planner_items WHERE spot_id = %s", (item_id,))
        conn.commit()
        print(f"플래너 항목 {item_id} 삭제됨")

        # 삭제된 항목 확인
        if cursor.rowcount > 0:
            return jsonify({"message": f"플래너 항목 {item_id}가 삭제되었습니다!"}), 200
        else:
            return jsonify({"error": "삭제할 항목이 없습니다."}), 404

    except Exception as e:
        print("플래너 항목 삭제 실패:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

#플래너 조회
@app.route('/api/planner/info')
def get_planner_info():
    planner_id = request.args.get('plannerId')
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM planners WHERE id = %s", (planner_id,))
        data = cursor.fetchone()
    conn.close()
    return jsonify(data)

#플래너 안에 장바구니 정보 조회
@app.route('/api/planner/items')
def get_planner_items():
    planner_id = request.args.get('plannerId')
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM planner_items WHERE planner_id = %s", (planner_id,))
        data = cursor.fetchall()
    conn.close()
    return jsonify({'items': data})

#여러개의 플래너 가져오기 /마이페이지 카드
@app.route('/api/planner/list')
def get_planner_list():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'userId 파라미터가 필요합니다.'}), 400

    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM planners WHERE user_id = %s", (user_id,))
        planners = cursor.fetchall()
    conn.close()
    return jsonify({'plans': planners})


#스케줄페이지 순서랑 방문일자 업데이트
@app.route('/api/planner/update-item', methods=['POST'])
@require_api_key
def update_planner_item():
    data = request.get_json()
    item_id = data.get('id')
    visit_date = data.get('visitDate')
    sequence = data.get('sequence')

    if not item_id or visit_date is None or sequence is None:
        return jsonify({'error': 'id, visitDate, sequence 값이 필요합니다.'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE planner_items
            SET visit_date = %s, sequence = %s
            WHERE id = %s
        """, (visit_date, sequence, item_id))
        conn.commit()
        return jsonify({'message': '일정이 성공적으로 업데이트되었습니다.'})
    except Exception as e:
        print("플래너 항목 업데이트 실패:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/google/search-places', methods=['GET'])
def proxy_google_search_places():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Missing query parameter'}), 400

    GOOGLE_API_KEY = os.getenv('VITE_GOOGLE_PLACES_API_KEY')
    search_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
    params = {
        'query': query,
        'language': 'ko',
        'key': GOOGLE_API_KEY
    }

    try:
        res = requests.get(search_url, params=params)
        return jsonify(res.json())
    except Exception as e:
        print("🔥 Google Places 프록시 에러:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/google/batch-places', methods=['POST'])
def batch_google_places():
    data = request.get_json()
    region = data.get("region")
    place_names = data.get("place_names")

    if not region or not place_names:
        return jsonify({"error": "Missing region or place_names"}), 400

    GOOGLE_API_KEY = os.getenv('VITE_GOOGLE_PLACES_API_KEY')
    search_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json'

    # 각 장소에 대해 Google Places API에서 사진 URL 추출
    def fetch_place(name):
        query = f"{region} {name}"
        try:
            # 1️⃣ 이미 캐시에 있으면 바로 URL 생성
            if name in photo_ref_cache:
                ref = photo_ref_cache[name]
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={ref}&key={GOOGLE_API_KEY}"
                return {"장소명": name, "photoUrls": [photo_url]}

            # 2️⃣ 없으면 API 요청해서 가져오고 캐시에 저장
            params = {
                'query': query,
                'language': 'ko',
                'key': GOOGLE_API_KEY
            }
            res = requests.get(search_url, params=params, timeout=5)
            data = res.json()
            first_result = data.get('results', [None])[0]

            if not first_result or 'photos' not in first_result:
                return {"장소명": name, "photoUrls": ["/no-image.jpg"]}


            ref = first_result['photos'][0]['photo_reference']
            photo_ref_cache[name] = ref
            save_cache()# 캐시에 저장

            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={ref}&key={GOOGLE_API_KEY}"
            return {"장소명": name, "photoUrls": [photo_url]}

        except Exception as e:
            print(f"❌ Error fetching {name}: {e}")
            return {"장소명": name, "photoUrls": []}


    # 🧠 최대 동시 요청 수 제한 → 서버와 Google API 둘 다 보호
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(fetch_place, place_names))

    return jsonify({"results": results})




# ✅ 추천 장소 캐시 저장소 초기화
app.config['RECOMMENDATION_CACHE'] = {}

# ✅ 서버 시작 시 미리 불러올 지역 리스트
PRELOAD_REGIONS = ['서울', '부산', '제주', '경주', '강릉', '전주', '여수', '속초']

# ✅ 추천 장소 미리 불러오기 함수
def preload_recommendations():
    GOOGLE_API_KEY = os.getenv('VITE_GOOGLE_PLACES_API_KEY')
    for region in PRELOAD_REGIONS:
        try:
            categories = {
                "명소": f"{region} 여행 명소",
                "맛집": f"{region} 맛집",
                "숙소": f"{region} 숙소"
            }
            app.config['RECOMMENDATION_CACHE'][region] = {}

            for key, query in categories.items():
                response = requests.get(
                    'https://maps.googleapis.com/maps/api/place/textsearch/json',
                    params={'query': query, 'language': 'ko', 'key': GOOGLE_API_KEY},
                    timeout=5
                )
                if response.ok:
                    results = response.json().get('results', [])[:10]
                    app.config['RECOMMENDATION_CACHE'][region][key] = results
                    print(f"✅ {region} {key} 미리 로드 완료 ({len(results)}개)")
                else:
                    print(f"❌ {region} {key} 로드 실패: {response.status_code}")
        except Exception as e:
            print(f"🔥 {region} 데이터 로딩 중 오류: {e}")

preload_recommendations()
# ✅ 추천 장소 조회 API
@app.route('/api/preloaded-recommendations/<region>', methods=['GET'])
def get_preloaded(region):
    region = region.strip()
    return jsonify(app.config['RECOMMENDATION_CACHE'].get(region, {
        "명소": [],
        "맛집": [],
        "숙소": []
    }))



