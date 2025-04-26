const API_URL = import.meta.env.VITE_WEB_API_URL;
const API_KEY = import.meta.env.VITE_WEB_API_KEY;

// 🔧 여기서 searchTerm을 매개변수로 받아야 함!
export async function getPlaces(searchTerm) {
  const url = searchTerm
  ? `${API_URL}/api/places?q=${encodeURIComponent(searchTerm)}`
  : `${API_URL}/api/places`;

  try {
    const res = await fetch(url, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    if (!res.ok) throw new Error('API 실패');
    return await res.json();
  } catch (err) {
    console.error('getPlaces 에러:', err);
    return [];
  }
}

export async function getRegister(username, password) {
  try {
    const res = await axios.post(`${API_URL}/api/places`, {
      username,
      password
    });
    return res.data;  // 성공 메시지 반환
  } catch (error) {
    throw error.response?.data || error;
  }
}
