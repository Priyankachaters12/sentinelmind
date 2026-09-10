import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  User, 
  Wind, 
  ShieldAlert, 
  FileText, 
  BookOpen, 
  Trash2,
  ChevronDown,
  PhoneCall
} from 'lucide-react';

export default function Chatbot({ 
  distressContext, 
  openGrounding, 
  openAssessment, 
  openJournal, 
  openCheckIn,
  openAlertSender 
}) {
  const { fetchWithAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am **SentinelMind AI Assistant**. How are you feeling today? I am here to help with coping strategies, grounding techniques, or explaining your wellness scores.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '4-7-8 Breathing', action: 'open_grounding' },
        { label: 'I feel anxious', action: 'preset_anxiety' },
        { label: 'Explain my score', action: 'preset_score' }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleActionClick = (actionKey) => {
    if (actionKey === 'open_grounding') {
      openGrounding && openGrounding();
    } else if (actionKey === 'open_assessment') {
      openAssessment && openAssessment();
    } else if (actionKey === 'open_journal') {
      openJournal && openJournal();
    } else if (actionKey === 'open_checkin') {
      openCheckIn && openCheckIn();
    } else if (actionKey === 'open_alert_sender') {
      openAlertSender && openAlertSender();
    } else if (actionKey === 'call_988') {
      window.open('tel:988', '_self');
    } else if (actionKey === 'preset_anxiety') {
      sendMessage("I am feeling anxious and overwhelmed. Can you help me calm down?");
    } else if (actionKey === 'preset_score') {
      sendMessage("Can you explain my current distress risk score?");
    }
  };

  const sendMessage = async (textToSend) => {
    const msgText = textToSend || input.trim();
    if (!msgText || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetchWithAuth('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          distressContext: distressContext || {}
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          isEmergency: data.isEmergency,
          suggestedActions: data.suggestedActions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: "I am having trouble connecting to the server right now. However, if you are experiencing distress, please try our 4-7-8 Breathing exercise or contact 988 Crisis Lifeline.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: 'Try 4-7-8 Breathing', action: 'open_grounding' },
            { label: 'Send Emergency Alert', action: 'open_alert_sender' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Floating Toggle Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-2xl hover:shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 group border border-white/20"
          title="Open SentinelMind AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse"></span>
          </div>
          <span className="font-bold text-xs pr-1 hidden sm:inline-block">AI Assistant</span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600/90 border border-teal-400/30 flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">SentinelMind AI</h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-400/20">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">Empathetic Mental Wellness Companion</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat History"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    msg.sender === 'user' 
                      ? 'bg-slate-800 text-white' 
                      : msg.isEmergency 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-teal-600 text-white'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs font-medium'
                      : msg.isEmergency
                        ? 'bg-rose-50 border border-rose-200 text-rose-950 rounded-tl-xs shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}>
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>

                    {/* Action buttons if available */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-100">
                        {msg.suggestedActions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(act.action)}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold transition-all flex items-center space-x-1"
                          >
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs italic p-2 bg-white/80 rounded-xl w-fit border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></div>
                <span>SentinelMind AI is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] font-semibold">
            <button
              onClick={() => sendMessage("I am feeling very anxious")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              😰 I feel anxious
            </button>
            <button
              onClick={() => sendMessage("Help me do a breathing exercise")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 transition-all"
            >
              🫁 4-7-8 Breathing
            </button>
            <button
              onClick={() => sendMessage("How do I improve my sleep?")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              🌙 Better Sleep
            </button>
            <button
              onClick={() => openAlertSender && openAlertSender()}
              className="shrink-0 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all"
            >
              🚨 Send Alert
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SentinelMind AI..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
