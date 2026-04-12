import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "What's my peak usage?",
  "How to reduce consumption?",
  "System status",
  "Weather conditions",
  "Dataset info",
  "Energy waste report",
];

export const AIChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'I am the Kinetic Ether AI. Ask me about your energy usage, system status, forecasts, or how to optimize consumption.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const r = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await r.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection lost. Backend may be unreachable.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
          isOpen
            ? 'bg-surface-container-highest text-muted rotate-0'
            : 'gradient-primary text-[#231000]'
        }`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[600px] bg-[#0a1628]/95 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[#231000] text-lg">psychology</span>
              </div>
              <div>
                <h3 className="text-sm font-bold font-headline text-on-surface">Kinetic AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary pulse-live"></span>
                  <span className="text-[9px] text-secondary font-bold tracking-widest uppercase">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[300px] max-h-[400px] scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/20 text-primary rounded-br-md'
                      : 'bg-surface-container-highest/80 text-on-surface-variant rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-highest/80 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-[10px] font-bold tracking-wider text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about energy, forecasts, status..."
                className="flex-1 bg-surface-container-low/60 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder-muted-dark border border-white/5 focus:outline-none focus:border-primary/40 transition-colors font-body"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-[#231000] disabled:opacity-40 transition-all hover:brightness-110 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
