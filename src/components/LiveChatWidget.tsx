'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Minimize2,
  Maximize2,
  HelpCircle,
  FileQuestion,
  UserCheck,
} from 'lucide-react';
import { ChatMessage } from '@/lib/chat-storage';

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialisation de la session au montage
  useEffect(() => {
    let savedSession = localStorage.getItem('impots_chat_session');
    if (!savedSession) {
      savedSession = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('impots_chat_session', savedSession);
    }
    setSessionId(savedSession);

    // Charger les messages existants
    fetch(`/api/chat?sessionId=${savedSession}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.session && data.session.messages && data.session.messages.length > 0) {
          setMessages(data.session.messages);
        } else {
          // Message d'accueil par défaut
          setMessages([
            {
              id: 'welcome',
              sender: 'agent',
              authorName: 'Agent de permanence',
              text: 'Bonjour ! 👋 Je suis l’agent d’accompagnement de votre communauté. Vous avez une question sur les documents à fournir (CNI, avis 2026, 3 fiches de paie, facture EDF) ou sur votre droit à la restitution ? Posez votre question ici, je vous réponds instantanément !',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((err) => console.error('Erreur chargement messages chat:', err));
  }, []);

  // Défilement automatique vers le bas
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !sessionId) return;

    if (!textToSend) {
      setInputText('');
    }

    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      authorName: 'Vous',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          text,
          sender: 'user',
        }),
      });

      const data = await res.json();
      if (res.ok && data.messages) {
        // Petit délai naturel pour donner l'impression de réflexion
        setTimeout(() => {
          setMessages(data.messages);
          setIsTyping(false);
        }, 500);
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.error('Erreur envoi message chat:', err);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* BULLE FLOTTANTE FERMÉE */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2">
          {/* Badge d'invitation discret */}
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-white text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2 animate-bounce hover:bg-slate-50 transition"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Une question ? Un agent est en ligne</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setHasNewMessage(false);
            }}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 transition transform hover:scale-105 relative group"
            title="Ouvrir le chat avec un conseiller"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      )}

      {/* FENÊTRE DE CHAT OUVERTE */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* EN-TÊTE DU CHAT */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white border border-white/30">
                  <UserCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-blue-700 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Agent d’Accompagnement</h3>
                <p className="text-[11px] text-blue-200 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  En ligne • Réponse instantanée
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Fermer le chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ZONE DES MESSAGES */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 px-1 mb-0.5">
                    {msg.authorName || (isUser ? 'Vous' : 'Conseiller')}
                  </span>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-400 px-1 mb-0.5">Agent d’accompagnement</span>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUESTIONS RAPIDES SUGGÉRÉES */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {[
              'Quels documents fournir ?',
              'Je gagne peu, ai-je droit ?',
              'Où trouver mon avis 2026 ?',
              'Combien de temps ça prend ?',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                className="shrink-0 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* ZONE DE SAISIE */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Posez votre question à l'agent..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-xl border border-transparent focus:border-blue-600 focus:outline-none transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-sm"
              title="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

