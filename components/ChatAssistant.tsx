
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, X, Loader2, Volume2 } from 'lucide-react';
import { Message } from '../types';
import { chatWithGemini } from '../services/geminiService';

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm LifePulse AI. How can I help you with your health today? You can ask me about symptoms, upload reports, or ask for diet advice.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date(),
      attachment: attachedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      // Prepare history for context
      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const responseText = await chatWithGemini(userMsg.text, history, userMsg.attachment);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please check your internet or API key.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + " " + transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
        setIsRecording(false);
    };

    recognition.start();
  };

  const QuickChip = ({ text }: { text: string }) => (
    <button 
      onClick={() => setInputValue(text)}
      className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-100 transition whitespace-nowrap"
    >
      {text}
    </button>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
            }`}>
              {msg.attachment && (
                <img src={msg.attachment} alt="User upload" className="w-full h-40 object-cover rounded-lg mb-2 border border-white/20" />
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex items-center gap-2 text-slate-500 text-sm">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                Thinking...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 p-3 pb-safe">
        {/* Quick Chips */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
            <QuickChip text="Check symptoms" />
            <QuickChip text="Give diet plan" />
            <QuickChip text="Explain medical terms" />
        </div>

        {/* Attachment Preview */}
        {attachedImage && (
          <div className="relative inline-block mb-2">
            <img src={attachedImage} alt="Attachment" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
            <button 
              onClick={() => setAttachedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition"
          >
            <ImageIcon size={22} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything..."
              className="w-full bg-slate-100 border-0 rounded-full py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-indigo-500 transition text-sm text-slate-900"
            />
          </div>

          <button 
             onClick={toggleRecording}
             className={`p-2 rounded-full transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}
          >
             <Mic size={22} />
          </button>

          <button 
            onClick={handleSendMessage}
            disabled={(!inputValue && !attachedImage) || isLoading}
            className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm shadow-indigo-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
