import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import SourceCitation from './SourceCitation';

const QUICK_QUESTIONS = [
  'Interpret the latest PHQ-9 score for this patient',
  'What coping strategies should we recommend?',
  'What are the CBT treatment steps for depression?',
  'Explain the crisis intervention protocol',
];

export default function ChatInterface({ patient }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hello! I am the Mental Health AI Assistant for ${patient.name} (ID: ${patient.patient_id}).\n\nI have access to their clinical records and can help you with:\n• Interpreting PHQ-9 and GAD-7 assessment scores\n• Evidence-based treatment recommendations\n• Crisis intervention protocols\n• Coping strategies and psychoeducation\n\nAll my responses are grounded in clinical documents with source citations. What would you like to know?`,
      sources: [],
      crisis_detected: false,
      crisis_resources: null,
    }]);
  }, [patient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;
    setInput('');

    const userMessage = {
      role: 'user',
      content: messageText,
      sources: [],
      crisis_detected: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        patient_id: patient.patient_id,
        session_id: sessionId,
        message: messageText,
      });

      const data = res.data;
      if (!sessionId) setSessionId(data.session_id);

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        sources: data.sources || [],
        crisis_detected: data.crisis_detected,
        crisis_resources: data.crisis_resources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running at http://localhost:8000 and try again.',
        sources: [],
        crisis_detected: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '620px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#22c55e',
        }} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
          Mental Health AI — {patient.name}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: '#94a3b8',
        }}>
          RAG powered · Sources cited · Crisis detection active
        </span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.crisis_detected && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '8px',
                width: '100%',
              }}>
                <div style={{
                  fontWeight: '700',
                  color: '#dc2626',
                  fontSize: '14px',
                  marginBottom: '8px',
                }}>
                  ⚠️ Crisis Indicators Detected — Immediate Action Required
                </div>
                {msg.crisis_resources && (
                  <ul style={{
                    paddingLeft: '18px',
                    color: '#b91c1c',
                    fontSize: '13px',
                    lineHeight: '1.8',
                  }}>
                    {msg.crisis_resources.map((resource, j) => (
                      <li key={j}>{resource}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div style={{
              maxWidth: '80%',
              padding: '11px 15px',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.65',
              backgroundColor: msg.role === 'user' ? '#6366f1' : '#f1f5f9',
              color: msg.role === 'user' ? '#ffffff' : '#1e293b',
              borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
              borderBottomLeftRadius: msg.role === 'user' ? '12px' : '2px',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div style={{
                marginTop: '6px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
              }}>
                {msg.sources.map((source, j) => (
                  <SourceCitation key={j} source={source} />
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
            <div style={{
              padding: '11px 15px',
              borderRadius: '12px',
              borderBottomLeftRadius: '2px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              gap: '5px',
              alignItems: 'center',
            }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#94a3b8',
                    animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              padding: '5px 11px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#475569',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '8px',
        backgroundColor: '#ffffff',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Mental Health AI about this patient..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1e293b',
            backgroundColor: '#f8fafc',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading || !input.trim() ? '#a5b4fc' : '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
