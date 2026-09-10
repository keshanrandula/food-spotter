'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  RefreshCw,
  Wine,
  Cake,
  Utensils,
  ChevronRight,
  User,
  MessageSquare,
  BadgePercent,
  Compass
} from 'lucide-react';
import { Restaurant, ChatMessage } from '@/types';

interface ChefAiChatbotProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const ChefAiChatbot: React.FC<ChefAiChatbotProps> = ({
  restaurants,
  onSelectRestaurant,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialWelcomeMessage: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Ayubowan! 👨‍🍳 I am **Chef AI**, your personal culinary concierge.\n\nAsk me anything in **English, Sinhala, or Singlish**! For example:\n• *"Rs. 15,000 budget for 4 guests with romantic vibe"* \n• *"Pair drinks and dessert with Truffle Pasta or Jaffna Crab Curry"*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    {
      label: '🥂 Romantic Rs. 15,000 (4 Guests)',
      prompt: 'මට යහළුවන් 4 දෙනෙක් එක්ක රෑට Rs. 15,000 ක budget එකකට romantic vibe එකක් තියෙන place එකක් සොයා දෙන්න',
    },
    {
      label: '🍷 Drink & Dessert Pairing Guide',
      prompt: 'What beverage and dessert pairings go best with Seafood Crab Curry and Truffle Pasta?',
    },
    {
      label: '🇱🇰 Rooftop Sri Lankan Seafood',
      prompt: 'Recommend top rated Sri Lankan rooftop spots with ocean views for dinner',
    },
    {
      label: '🍕 Italian Date Night < Rs. 10,000',
      prompt: 'Suggest cozy Italian restaurant for 2 people with date night atmosphere under Rs. 10,000',
    },
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages,
          restaurants,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const aiMsg: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'assistant',
          text: data.data.replyText || 'Here are my top culinary recommendations:',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendations: data.data.recommendations || [],
          pairings: data.data.pairings || [],
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Failed to get Chef AI response:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Apologies, I had trouble parsing that request. Please try asking again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialWelcomeMessage]);
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-savor-600 via-amber-500 to-savor-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-amber-300/30 active:scale-95"
          >
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-amber-100"></span>
            </span>

            <Bot size={20} className="text-amber-100 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-xs sm:text-sm tracking-wide text-white">Ask Chef AI</span>
            
            <span className="bg-white/20 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
              NEW
            </span>
          </button>
        )}
      </div>

      {/* CHAT MODAL / DRAWER WINDOW */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[460px] h-[86vh] sm:h-[640px] max-h-[92vh] bg-stone-900 text-white rounded-3xl shadow-2xl border border-stone-700/60 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* HEADER */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-savor-600 to-amber-400 p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center">
                  <Bot size={20} className="text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base flex items-center gap-1.5">
                  Chef AI Concierge
                  <Sparkles size={14} className="text-amber-400" />
                </h3>
                <p className="text-[11px] text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Mood Matcher & Beverage Sommelier
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Chat"
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-900/90 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[90%]">
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-savor-600/30 border border-savor-500/40 flex items-center justify-center text-amber-400 shrink-0 mb-1">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-savor-600 to-amber-600 text-white rounded-br-none shadow-md'
                        : 'bg-stone-800 border border-stone-700/70 text-stone-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* EMBEDDED RECOMMENDATIONS CARDS */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-700/60 space-y-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <Compass size={12} /> Top Matched Places
                        </div>
                        {msg.recommendations.map((spot, idx) => {
                          const matchedRest = restaurants.find(r => r.id === spot.restaurantId || r.name.toLowerCase() === spot.restaurantName.toLowerCase());
                          return (
                            <div
                              key={idx}
                              className="bg-stone-900/90 border border-amber-500/20 hover:border-amber-400/50 p-3 rounded-xl transition group"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold font-serif text-white text-xs sm:text-sm group-hover:text-amber-300 transition">
                                  {spot.restaurantName}
                                </h4>
                                {spot.estimatedCostPerPerson && (
                                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    {spot.estimatedCostPerPerson}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                                {spot.reason}
                              </p>

                              {spot.suggestedDishes && spot.suggestedDishes.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {spot.suggestedDishes.map((dish, dIdx) => (
                                    <span
                                      key={dIdx}
                                      className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md border border-stone-700"
                                    >
                                      🍽️ {dish}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {matchedRest && (
                                <button
                                  onClick={() => {
                                    onSelectRestaurant(matchedRest);
                                    setIsOpen(false);
                                  }}
                                  className="mt-2.5 w-full py-1.5 px-3 bg-stone-800 hover:bg-savor-600 text-amber-200 hover:text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition"
                                >
                                  View Details & Book Table <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* EMBEDDED FOOD & BEVERAGE PAIRING CARDS */}
                    {msg.pairings && msg.pairings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-700/60 space-y-2.5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <Wine size={12} /> Sommelier Beverage & Dessert Pairings
                        </div>
                        {msg.pairings.map((pair, pIdx) => (
                          <div
                            key={pIdx}
                            className="bg-stone-950/80 border border-stone-700/80 p-3 rounded-xl space-y-2 text-xs"
                          >
                            <div className="font-bold text-amber-300 flex items-center gap-1.5">
                              <Utensils size={13} className="text-savor-400" />
                              Target Dish: <span className="text-white font-serif">{pair.dish}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 pt-1">
                              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800 flex items-start gap-2">
                                <Wine size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] text-stone-400 font-semibold uppercase">Beverage Pairing</div>
                                  <div className="text-[11px] text-stone-200 font-medium">{pair.beveragePairing}</div>
                                </div>
                              </div>

                              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800 flex items-start gap-2">
                                <Cake size={14} className="text-pink-400 shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] text-stone-400 font-semibold uppercase">Dessert Pairing</div>
                                  <div className="text-[11px] text-stone-200 font-medium">{pair.dessertPairing}</div>
                                </div>
                              </div>
                            </div>

                            {pair.notes && (
                              <p className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-800">
                                💡 Note: {pair.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-stone-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-400 text-xs py-2">
                <div className="w-6 h-6 rounded-lg bg-savor-600/30 border border-savor-500/40 flex items-center justify-center text-amber-400">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] font-medium text-stone-300">Chef AI is curating recommendations...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* QUICK PROMPTS HORIZONTAL SCROLLBAR */}
          <div className="px-3 py-2 bg-stone-950 border-t border-stone-800/80 overflow-x-auto flex gap-2 no-scrollbar shrink-0">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-stone-800 hover:bg-savor-900 border border-stone-700 hover:border-amber-500/50 text-[11px] text-stone-300 hover:text-amber-200 transition shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Chef AI (e.g. Rs. 15,000 budget / Romantic...)"
              disabled={isLoading}
              className="flex-1 bg-stone-900 border border-stone-700/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-savor-600 to-amber-500 text-white disabled:opacity-40 hover:scale-105 transition shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
