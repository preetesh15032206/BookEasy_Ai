/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { motion } from 'motion/react';

const MOCK_USER_ID = "11111111-1111-1111-1111-111111111111"; // Setup testing user

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
       setMessages([{ role: 'bot', text: 'Hello! I am BookEasy. I can help search for hotels, book a suite, or manage your bookings. How can I help you today?' }]);
    });

    socket.on('chat response', (data) => {
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    socketRef.current.emit('chat message', { text: input, user_id: MOCK_USER_ID });
    setInput('');
  };

  const handleIngest = async () => {
      if (isIngesting) return;
      setIsIngesting(true);
      try {
        const res = await fetch('/api/ingest', { method: 'POST' });
        const data = await res.json();
        if(data.success) {
           setMessages(prev => [...prev, { role: 'bot', text: `✅ Successfully ingested ${data.count} items into Pinecone!` }]);
        } else {
           setMessages(prev => [...prev, { role: 'bot', text: `❌ Ingestion Error: ${data.error}` }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { role: 'bot', text: `❌ Request Error: ${String(err)}` }]);
      } finally {
        setIsIngesting(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans relative overflow-hidden flex flex-col selection:bg-cyan-500/30">
      {/* Futuristic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col pt-8 pb-6 px-4 relative z-10">
      
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between py-6 mb-4 border-b border-white/10"
        >
           <div>
              <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                BookEasy AI
              </h1>
              <p className="text-cyan-500/70 mt-1 font-mono text-sm tracking-wider uppercase">System.RAG.Terminal // Online</p>
           </div>
           <button 
             onClick={handleIngest} 
             disabled={isIngesting}
             className="px-5 py-2.5 bg-slate-900 border border-cyan-500/30 text-cyan-400 text-sm font-mono font-medium hover:bg-cyan-950 focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] overflow-hidden relative group"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
              <span className="relative">{isIngesting ? '[ INGESTING... ]' : '[ SYNC VECTOR DB ]'}</span>
           </button>
        </motion.div>

        <div className="flex-1 overflow-y-auto space-y-6 px-2 pr-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-5 max-w-[85%] leading-relaxed whitespace-pre-wrap font-mono text-sm backdrop-blur-md ${
                msg.role === 'user' 
                  ? 'bg-fuchsia-600/10 border border-fuchsia-500/30 text-fuchsia-100 shadow-[0_0_20px_rgba(192,38,211,0.1)] rounded-tl-xl rounded-tr-xl rounded-bl-xl' 
                  : 'bg-cyan-950/20 border border-cyan-500/30 text-cyan-100/90 shadow-[0_0_20px_rgba(34,211,238,0.1)] rounded-tr-xl rounded-br-xl rounded-bl-xl'
                }`}
              >
                 {msg.role === 'bot' && (
                    <div className="flex items-center gap-2 mb-2 opacity-60 text-cyan-400 text-xs tracking-wider">
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                       BookEasy RAG
                    </div>
                 )}
                 <div>
                    {msg.text}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 pt-4 relative"
        >
           <div className="flex gap-3">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 p-4 bg-slate-900/50 backdrop-blur-md border border-slate-700 focus:border-cyan-500/50 rounded-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-inner text-cyan-50 font-mono placeholder:text-slate-600 transition-colors"
                placeholder="> Enter search query or booking command..."
              />
              <button 
                onClick={sendMessage}
                className="px-8 py-4 bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono font-bold tracking-widest focus:outline-none transition-all shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:text-cyan-100"
              >
                EXECUTE
              </button>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
