// src/pages/AIPromptPage.jsx
import { useState } from 'react';
import axios from 'axios';
import Navbar from '../assets/components/Navbar.jsx';

function AIPromptPage() {
  // 환경변수에서 API 키 불러오기
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // 대화 상태
  const [messages, setMessages] = useState([
    { role: 'system', content: '너는 여행 플래너 도우미야!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: newMessages
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      const reply = response.data.choices[0].message;
      setMessages([...newMessages, reply]);
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      alert('에러 발생: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '16px' }}>🧠 AI 여행 도우미</h2>

        {/* 대화 표시 영역 */}
        <div style={{
          border: '1px solid #ccc',
          padding: '20px',
          height: '400px',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
          borderRadius: '10px',
          marginBottom: '10px'
        }}>
          {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
            <div key={idx} style={{
              marginBottom: '12px',
              textAlign: msg.role === 'user' ? 'right' : 'left'
            }}>
              <strong>{msg.role === 'user' ? '나' : 'AI'}:</strong> {msg.content}
            </div>
          ))}
          {loading && <p>AI가 답변 중...</p>}
        </div>

        {/* 입력창 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 제주도 2박 3일 일정 짜줘"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: '12px 20px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            전송
          </button>
        </div>
      </div>
    </>
  );
}

export default AIPromptPage;
