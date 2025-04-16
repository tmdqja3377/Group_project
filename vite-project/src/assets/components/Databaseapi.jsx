const API_URL = import.meta.env.VITE_WEB_API_URL;
const API_KEY = import.meta.env.VITE_WEB_API_KEY;

// 🔧 여기서 searchTerm을 매개변수로 받아야 함!
export async function getPlaces(searchTerm) {
  const url = `${API_URL}/api/places?q=${encodeURIComponent(searchTerm)}`;
  console.log("🚀 [getPlaces] 요청 URL:", url);

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
