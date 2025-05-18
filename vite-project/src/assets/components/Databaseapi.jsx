import axios from 'axios';

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

export async function registerUser(userid, username, password) {
  try {
    const res = await axios.post(`${API_URL}/api/register`, {
      userid,
      username,
      password
    });
    return res.data;  // 성공 메시지 반환
  } catch (error) {
    throw error.response?.data || error;
  }
}


export async function loginUser(userid, password) {
  try {
    const res = await axios.post(`${API_URL}/api/login`, {
      userid,
      password
    }, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    return res.data;  // 로그인 성공 메시지 반환
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function getNaverUserInfo(code, state) {
  const res = await axios.post(`${import.meta.env.VITE_WEB_API_URL}/api/naver-login`, {
    code,
    state
  });
  return res.data;
}

// 사용자 정보 불러오기
export async function getUserInfo(userid) {
  try {
    const res = await axios.get(`${API_URL}/api/user-info`, {
      params: { userid },
      headers: {
        'x-api-key': API_KEY
      }
    });
    return res.data;
  } catch (err) {
    console.error('getUserInfo 에러:', err);
    throw err;
  }
}

// 사용자 탈퇴
export async function deleteUser(userid) {
  try {
    const res = await axios.post(`${API_URL}/api/user-delete`, {
      userid
    }, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    return res.data;
  } catch (err) {
    console.error('deleteUser 에러:', err);
    throw err;
  }
}

// 사용자 정보 수정
export async function updateUserProfile(data) {
  try {
    const res = await axios.post(`${API_URL}/api/user-update`, data, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    return res.data;
  } catch (err) {
    console.error('updateUserProfile 에러:', err);
    throw err.response?.data || err;
  }
}

// 비밀번호 변경
export async function changeUserPassword(data) {
  try {
    const res = await axios.post(`${API_URL}/api/password-change`, data, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    return res.data;
  } catch (err) {
    console.error('changeUserPassword 에러:', err);
    throw err.response?.data || err;
  }
}

export async function createPlanner(tripData) {
  try {
    const res = await axios.post(`${API_URL}/api/planner/create`, tripData, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    return res.data;
  } catch (error) {
    console.error('🛑 createPlanner 에러:', error);
    throw error.response?.data || error;
  }
}

//장바구니 항목추가
export async function addPlannerItem(plannerItemData) {
  try {
    console.log("서버로 전송되는 데이터:", plannerItemData);
    const res = await axios.post(`${API_URL}/api/planner/add-item-simple`, plannerItemData, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      }
    });
    console.log("서버 응답:", res.data);
    return res.data;  // 성공적인 응답 데이터 반환
  } catch (error) {
    console.error("플래너 아이템 추가 실패", error);
    throw error;  // 오류 발생 시 throw로 상위 호출로 전달
  }
}


//장바구니 항목삭제
export async function deletePlannerItem(plannerItemId) {
  try {
    console.log("삭제되는 항목 ID:", plannerItemId); // 로그 추가: 삭제되는 항목 확인
    const res = await axios.delete(`${API_URL}/api/planner/delete-item/${plannerItemId}`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      }
    });
    console.log("서버 응답:", res.data); // 로그 추가: 서버 응답 확인
    return res.data;  // 성공적인 응답 데이터 반환
  } catch (error) {
    console.error("플래너 항목 삭제 실패", error); // 오류 발생 시 로그
    throw error;  // 오류 발생 시 throw로 상위 호출로 전달
  }
}