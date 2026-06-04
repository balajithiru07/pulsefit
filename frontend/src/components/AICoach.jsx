import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Dumbbell, Sparkles, MessageCircle, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AICoach = ({ setTab }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: `Hello ${user?.name || 'Athlete'}! 👋 I am your PulseFit AI Fitness Coach. 

I have analyzed your profile settings. How can I help you optimize your health journey today? You can ask me to:
1. *"Show me a custom workout plan"*
2. *"What are my daily calorie and macro targets?"*
3. *"Predict my weight loss/gain timeline"*`
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'coach', text: data.reply }]);
      } else {
        const errData = await res.json();
        setMessages(prev => [...prev, { sender: 'coach', text: errData.message || 'Apologies, my processor encountered an error. Please try again.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'coach', text: 'Error connecting to the AI Coach. Please check your network connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = user?.subscriptionStatus === 'premium';

  return (
    <div className="glass-panel animate-fade-in" style={{
      maxWidth: '800px',
      margin: '0 auto',
      height: '620px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      
      {/* Chat Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <MessageCircle size={20} className="text-gradient-cyan-violet" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Fitness Coach Advisor</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} style={{ color: 'var(--color-cyan)' }} /> Active contextual advice
            </span>
          </div>
        </div>

        {/* Premium Badge & Monetization Hook */}
        <div>
          {isPremium ? (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-violet) 100%)',
              color: '#0b0f19'
            }}>
              PREMIUM PLAN ACTIVE
            </span>
          ) : (
            <div 
              onClick={() => setTab('billing')}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-amber)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Lock size={12} /> UPGRADE FOR UNLIMITED CHAT
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.01)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`chat-bubble ${msg.sender}`}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' 
                ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(159, 18, 57, 0.08) 100%)' 
                : 'rgba(0, 0, 0, 0.03)',
              border: msg.sender === 'user' 
                ? '1px solid rgba(6, 182, 212, 0.25)' 
                : '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '14px 18px',
              maxWidth: '85%',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              lineHeight: '1.6'
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble coach" style={{
            alignSelf: 'flex-start',
            background: 'rgba(0, 0, 0, 0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '18px 18px 18px 4px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--color-cyan)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--color-cyan)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--color-cyan)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-glass)',
        display: 'flex',
        gap: '12px',
        background: 'rgba(0, 0, 0, 0.02)'
      }}>
        <input
          type="text"
          className="form-input"
          placeholder={!isPremium && messages.filter(m => m.sender === 'user').length >= 3 
            ? 'Chat locked. Upgrade to Premium plan to continue chatting.' 
            : 'Ask about diet tips, workout splits, weight progress...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || (!isPremium && messages.filter(m => m.sender === 'user').length >= 3)}
          required
        />
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: '50px', height: '46px', padding: 0 }}
          disabled={loading || (!isPremium && messages.filter(m => m.sender === 'user').length >= 3)}
        >
          <Send size={18} style={{ transform: 'translateX(1px)' }} />
        </button>
      </form>

    </div>
  );
};
