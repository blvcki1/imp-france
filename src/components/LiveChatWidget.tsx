'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
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
  Headphones,
} from 'lucide-react';
import { ChatMessage } from '@/lib/chat-storage';

// Notification sonore douce et élégante via Web Audio API (aucun fichier externe requis)
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // Premier son (doux)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // Ré 5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Deuxième son (harmonique haute)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.09); // La 5
    gain2.gain.setValueAtTime(0.15, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.35);
  } catch {
    // Silencieux si l'audio n'est pas autorisé par le navigateur
  }
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'agent',
  authorName: 'Agent de permanence',
  text: "Bonjour ! 👋 Je suis l'agent d'accompagnement de votre communauté. Vous avez une question sur les documents à fournir (CNI, avis 2026, 3 fiches de paie, facture EDF) ou sur votre droit à la restitution ? Posez votre question ici, je vous réponds instantanément !",
  timestamp: new Date().toISOString(),
};

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAdvisorText, setLatestAdvisorText] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadedRef = useRef(false);
  const isSendingRef = useRef(false);
  const isOpenRef = useRef(isOpen);

  // Garder isOpenRef synchronisé pour le polling
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
      setLatestAdvisorText('');
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [isOpen]);

  // Initialisation de la session au montage
  useEffect(() => {
    let savedSession = localStorage.getItem('impots_chat_session');
    if (!savedSession) {
      savedSession = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('impots_chat_session', savedSession);
    }
    setSessionId(savedSession);
  }, []);

  // Fonction de polling pour charger et synchroniser les messages en direct
  const fetchMessages = useCallback(async () => {
    if (!sessionId || isSendingRef.current) return;

    try {
      const res = await fetch(`/api/chat?sessionId=${sessionId}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data.session && Array.isArray(data.session.messages) && data.session.messages.length > 0) {
        const serverMessages: ChatMessage[] = data.session.messages;

        // Premier chargement de la session
        if (!isInitialLoadedRef.current) {
          serverMessages.forEach((m) => knownMessageIdsRef.current.add(m.id));
          setMessages(serverMessages);
          isInitialLoadedRef.current = true;
          return;
        }

        // Détection de nouveaux messages arrivés depuis le dernier fetch
        let newAdvisorMessages = 0;
        let lastIncomingMessageText = '';
        let hasNewContent = false;

        serverMessages.forEach((m) => {
          if (!knownMessageIdsRef.current.has(m.id)) {
            knownMessageIdsRef.current.add(m.id);
            hasNewContent = true;
            if (m.sender === 'human_advisor' || m.sender === 'agent') {
              newAdvisorMessages++;
              lastIncomingMessageText = m.text;
            }
          }
        });

        if (hasNewContent) {
          setMessages(serverMessages);

          if (newAdvisorMessages > 0) {
            playNotificationSound();

            if (!isOpenRef.current) {
              setUnreadCount((prev) => prev + newAdvisorMessages);
              if (lastIncomingMessageText) {
                setLatestAdvisorText(lastIncomingMessageText);
              }
            } else {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }
          }
        }
      } else {
        // Aucune session sur le serveur pour le moment
        if (!isInitialLoadedRef.current) {
          setMessages([DEFAULT_WELCOME_MESSAGE]);
          isInitialLoadedRef.current = true;
        }
      }
    } catch (err) {
      // Échec temporaire de connexion
      console.warn('Erreur synchronisation chat:', err);
    }
  }, [sessionId]);

  // Boucle de polling continu en quasi temps réel (toutes les 2.5 secondes)
  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const runPoll = async () => {
      await fetchMessages();
      if (isMounted) {
        timerId = setTimeout(runPoll, 2500);
      }
    };

    runPoll();

    return () => {
      isMounted = false;
      clearTimeout(timerId);
    };
  }, [sessionId, fetchMessages]);

  // Défilement automatique vers le bas quand de nouveaux messages sont affichés
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Envoi d'un message par le visiteur
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

    knownMessageIdsRef.current.add(tempUserMsg.id);
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);
    isSendingRef.current = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({
          sessionId,
          text,
          sender: 'user',
        }),
      });

      const data = await res.json();
      if (res.ok && data.messages) {
        // Enregistrer tous les identifiants renvoyés
        data.messages.forEach((m: ChatMessage) => knownMessageIdsRef.current.add(m.id));

        // Délai naturel pour donner l'impression de réponse
        setTimeout(() => {
          setMessages(data.messages);
          setIsTyping(false);
          isSendingRef.current = false;
        }, 500);
      } else {
        setIsTyping(false);
        isSendingRef.current = false;
      }
    } catch (err) {
      console.error('Erreur envoi message chat:', err);
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Ne pas afficher le widget visiteur sur les pages d'administration
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* BULLE FLOTTANTE FERMÉE */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-2.5">
          {/* Notification interactive si un nouveau message de conseiller est arrivé */}
          {unreadCount > 0 ? (
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer max-w-xs bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-start gap-3 animate-bounce hover:scale-105 transition transform"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>Conseiller en direct</span>
                </div>
                <p className="mt-1 line-clamp-2 text-white/95 font-medium leading-relaxed">
                  {latestAdvisorText || 'Vous avez reçu une nouvelle réponse personnalisée !'}
                </p>
                <span className="inline-block mt-1 text-[10px] text-emerald-200 underline font-semibold">
                  Cliquez pour ouvrir le chat →
                </span>
              </div>
            </div>
          ) : (
            /* Badge d'invitation classique */
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer bg-white text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Une question ? Un conseiller est en ligne</span>
            </div>
          )}

          {/* Bouton rond principal */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 transition transform hover:scale-105 relative group"
            title="Ouvrir le chat avec un conseiller"
          >
            <MessageCircle className="w-7 h-7" />

            {/* Badge de notification non lue */}
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      )}

      {/* FENÊTRE DE CHAT OUVERTE */}
      {isOpen && (
        <div className="w-[92vw] sm:w-96 h-[530px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                <h3 className="font-bold text-sm leading-tight">Conseiller d’Accompagnement</h3>
                <p className="text-[11px] text-blue-200 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  En direct • Réponse instantanée
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
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isHumanAdvisor = msg.sender === 'human_advisor';

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Titre / Nom de l'expéditeur */}
                  <div className="flex items-center gap-1 px-1 mb-1">
                    {isHumanAdvisor && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Conseiller Officiel
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {isUser ? 'Vous' : isHumanAdvisor ? (msg.authorName || 'Conseiller de permanence') : 'Agent Restitution'}
                    </span>
                  </div>

                  {/* Bulle de message */}
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : isHumanAdvisor
                        ? 'bg-emerald-50 text-slate-900 border border-emerald-300 rounded-bl-xs shadow-sm font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Horodatage */}
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-400 px-1 mb-0.5">Conseiller en cours de rédaction...</span>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5 shadow-xs">
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
              placeholder="Posez votre question à un conseiller..."
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
