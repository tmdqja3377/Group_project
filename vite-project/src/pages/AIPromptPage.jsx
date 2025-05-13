import { useState } from 'react';
import axios from 'axios';
import Navbar from '../assets/components/Navbar.jsx';
import '../assets/css/AIPromptPage.css';

function AIPromptPage() {
  const apiKey = import.meta.env.VITE_CHAT_GPT_API_KEY;

  const [messages, setMessages] = useState([
    { role: 'system', content: '너는 여행 플래너 도우미야!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
          model: 'gpt-4o',
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
      <div className="ai-container">
        <h2 className="ai-title">🧠 AI 여행 도우미</h2>

        <div className="ai-chatbox">
          {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
            <div
              key={idx}
              className={`ai-message ${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              <strong>{msg.role === 'user' ? '나' : 'AI'}:</strong> {msg.content}
            </div>
          ))}
          {loading && <p>AI가 답변 중...</p>}
        </div>

        <div className="ai-inputbox">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 제주도 2박 3일 일정 짜줘"
            className="ai-input"
          />
          <button onClick={handleSend} className="ai-button">
            전송
          </button>
        </div>
      </div>
    </>
  );
}

export default AIPromptPage;
