import React from 'react';
import { ChatMessage, MessageRole } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: ChatMessage;
  onPlayAudio: (messageId: string, text: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onPlayAudio }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in-up`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
        }`}
      >
        <div className={`prose text-sm sm:text-base leading-relaxed break-words ${isUser ? 'prose-invert' : ''}`}>
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        
        {!isUser && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">RBSE Saathi</span>
            <button
              onClick={() => onPlayAudio(message.id, message.text)}
              disabled={message.isLoadingAudio || message.isAudioPlaying}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                 message.isAudioPlaying 
                   ? 'bg-rose-100 text-rose-600 animate-pulse' 
                   : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
               {message.isLoadingAudio ? (
                 <>
                   <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                 </>
               ) : message.isAudioPlaying ? (
                 <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span>Playing</span>
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                   </svg>
                   <span>Sunen (Listen)</span>
                 </>
               )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};