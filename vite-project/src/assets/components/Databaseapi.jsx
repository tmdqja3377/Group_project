const API_URL = import.meta.env.VITE_WEB_API_URL;
const API_KEY = import.meta.env.VITE_WEB_API_KEY;

export async function getPlaces() {
  try {
    const res = await fetch(API_URL, {
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