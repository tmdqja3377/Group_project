import { useState } from 'react';
import Navbar from '../assets/components/Navbar.jsx';
import axios from 'axios';

function AIPromptPage() {
    const [messages, setMessages] = useState([
        { role: 'system', content: '너는 여행 플래너 도우미야!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

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
                        Authorization: `Bearer ${OPENAI_API_KEY}`
                    }
                }
            );

            const reply = response.data.choices[0].message;
            setMessages([...newMessages, reply]);
        } catch (error) {
            alert('에러 발생: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto' }}>
                <h2>🧠 AI 여행 도우미</h2>
                <div style={{
                    border: '1px solid #ccc',
                    padding: '20px',
                    height: '400px',
                    overflowY: 'auto',
                    marginBottom: '10px'
                }}>
                    {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
                        <div key={idx} style={{
                            marginBottom: '10px',
                            textAlign: msg.role === 'user' ? 'right' : 'left'
                        }}>
                            <strong>{msg.role === 'user' ? '나' : 'AI'}:</strong> {msg.content}
                        </div>
                    ))}
                    {loading && <p>AI가 답변 중...</p>}
                </div>
                <div style={{ display: 'flex' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="여행지 추천해줘, 3일 일정 짜줘 등..."
                        style={{ flex: 1, padding: '10px' }}
                    />
                    <button onClick={handleSend} style={{ padding: '10px 20px' }}>
                        전송
                    </button>
                </div>
            </div>
        </>
    );
}

export default AIPromptPage;
