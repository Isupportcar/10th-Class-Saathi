import React, { useState, useRef, useEffect } from 'react';
import { AppView, ChatMessage, MessageRole, Subject } from './types';
import { SUBJECTS } from './constants';
import { sendMessageToTutor, generateAudioExplanation } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startChat = (subject: Subject) => {
    setSelectedSubject(subject);
    setView(AppView.CHAT);
    setMessages([
      {
        id: 'welcome',
        role: MessageRole.MODEL,
        text: `Namaste! Main aapka **${subject.name}** (${subject.hindiName}) tutor hoon. \n\nAsk me anything from your Class 10 RBSE syllabus!`,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await sendMessageToTutor(historyForApi, userMessage.text, selectedSubject?.name);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) { /* ignore if already stopped */ }
      audioSourceRef.current = null;
    }
    setMessages(prev => prev.map(m => ({ ...m, isAudioPlaying: false })));
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    // If playing, stop current
    stopAudio();

    // Init context if needed
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }

    // Set loading state
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLoadingAudio: true } : m));

    try {
        // Clean text for TTS (remove heavy markdown that might confuse TTS sometimes, though Gemini handles it well usually)
        // For now sending raw text as Gemini 2.5 TTS is robust.
        
        const audioBuffer = await generateAudioExplanation(text);

        // Set playing state
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLoadingAudio: false, isAudioPlaying: true } : m));

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
             setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioPlaying: false } : m));
        };

        source.start();
        audioSourceRef.current = source;

    } catch (error) {
        console.error("Audio playback failed", error);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLoadingAudio: false } : m));
        alert("Audio generate mein samsya aayi. Kripya punah prayas karein.");
    }
  };

  const handleBackToHome = () => {
    stopAudio();
    setView(AppView.HOME);
    setSelectedSubject(null);
  };

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
         <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              RBSE Class 10 Saathi
            </h1>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">2025 Syllabus</span>
         </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="text-center mb-10">
           <h2 className="text-3xl font-bold text-slate-800 mb-3">Aaj kya padhenge?</h2>
           <p className="text-slate-500">Select a subject to start your learning journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {SUBJECTS.map((subject) => (
            <button
              key={subject.id}
              onClick={() => startChat(subject)}
              className={`group flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${subject.color} bg-opacity-30 border-opacity-50`}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{subject.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{subject.name}</h3>
              <span className="text-sm font-medium text-slate-600 mb-2">{subject.hindiName}</span>
              <p className="text-xs text-slate-500 opacity-80">{subject.description}</p>
            </button>
          ))}
        </div>
      </main>
      
      <footer className="py-6 text-center text-slate-400 text-sm">
        Built with Gemini 2.5 • AI Tutor for RBSE
      </footer>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm z-20">
        <button 
          onClick={handleBackToHome}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedSubject?.icon}</span>
          <div>
             <h2 className="font-bold text-slate-800 leading-tight">{selectedSubject?.name}</h2>
             <p className="text-xs text-slate-500">{selectedSubject?.hindiName} • Class 10</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <ChatBubble 
            key={msg.id} 
            message={msg} 
            onPlayAudio={handlePlayAudio}
          />
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 flex gap-1">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Apna sawal yahan poochein (Ask here)..."
            className="flex-1 bg-slate-100 text-slate-800 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"
          >
            <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
           AI can make mistakes. Please check important info with your textbooks.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full max-w-screen mx-auto bg-white shadow-xl overflow-hidden">
      {view === AppView.HOME ? renderHome() : renderChat()}
    </div>
  );
};

export default App;