from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# JSON 파일 읽어오기
with open('전국관광지정보표준데이터.json', encoding='utf-8') as f:
    data = json.load(f)['records']

@app.route('/api/autocomplete', methods=['GET'])
def autocomplete():
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify([])

    suggestions = []
    for item in data:
        name = item.get('관광지명', '')
        if keyword in name:
            suggestions.append(name)
        if len(suggestions) >= 10:
            break

    return jsonify(suggestions)

if __name__ == '__main__':
    app.run(debug=True)
