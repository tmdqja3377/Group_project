# app.py
from flask import Flask, jsonify, request, redirect
import pymysql
from flask_cors import CORS
from config import ACCESS_KEY, HOST, USER, PW, NAME, CLIENT, SECRET
import bcrypt
from mysql.connector.cursor import MySQLCursorDict
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

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
            cursor.execute("SELECT userid, username FROM usertable WHERE userid = %s", (userid,))
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
    name = data.get('name')
    birth = data.get('birth')
    gender = data.get('gender')
    phone = data.get('phone')
    email = data.get('email')

    if not userid:
        return jsonify({'error': 'userid는 필수입니다.'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE usertable
            SET username = %s, birth = %s, gender = %s, phone = %s, email = %s
            WHERE userid = %s
        """, (name, birth, gender, phone, email, userid))

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

@app.route('/api/planner/add-item', methods=['POST'])
@require_api_key
def add_planner_item():
    data = request.get_json()
    user_id = data.get('userId')
    planner_id = data.get('plannerId')
    spot_id = data.get('spotId')
    visit_date = data.get('visitDate')
    sequence = data.get('sequence')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    spot_name = data.get('spotName')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # planner_id가 plannners 테이블에 존재하는지 확인
        cursor.execute("SELECT id FROM planners WHERE id = %s", (planner_id,))
        planner = cursor.fetchone()
        if not planner:
            return jsonify({"error": "Invalid planner_id"}), 400  # 유효하지 않은 플래너 ID

        # planner_items 테이블에 데이터 삽입
        cursor.execute("""
            INSERT INTO planner_items (planner_id, spot_id, visit_date, sequence, latitude, longitude, spotName)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            planner_id,
            spot_id,
            visit_date,
            sequence,
            latitude,
            longitude,
            spot_name
        ))

        conn.commit()
        return jsonify({"message": "플래너 항목이 성공적으로 추가되었습니다!"}), 201
    except Exception as e:
        print("플래너 항목 추가 실패:", e)
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
