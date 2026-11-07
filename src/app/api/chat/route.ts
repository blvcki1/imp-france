import { NextRequest, NextResponse } from 'next/server';
import {
  getAllChatSessions,
  getChatSession,
  saveChatSession,
  generateInstantAgentReply,
  ChatSession,
  ChatMessage,
} from '@/lib/chat-storage';
import crypto from 'crypto';

export const runtime = 'nodejs';

// GET: Récupère les sessions ou les messages d'une session spécifique
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const session = getChatSession(sessionId);
      if (!session) {
        return NextResponse.json({ success: true, messages: [] });
      }
      return NextResponse.json({ success: true, session });
    }

    const sessions = getAllChatSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Envoi d'un message et réponse instantanée de l'agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, text, sender, authorName, dossierCode } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Le message ne peut pas être vide' }, { status: 400 });
    }

    const currentSessionId = sessionId || `chat_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    let session = getChatSession(currentSessionId);

    if (!session) {
      session = {
        id: currentSessionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        unreadAdminCount: 0,
        dossierCode: dossierCode || undefined,
      };
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: sender === 'admin' ? 'human_advisor' : 'user',
      authorName: authorName || (sender === 'admin' ? 'Conseiller de permanence' : 'Vous'),
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    session.messages.push(userMsg);

    // Si le message vient du visiteur, générer immédiatement la réponse de l'agent
    let agentMsg: ChatMessage | null = null;
    if (sender !== 'admin') {
      session.unreadAdminCount = (session.unreadAdminCount || 0) + 1;

      const replyText = generateInstantAgentReply(userMsg.text);

      agentMsg = {
        id: crypto.randomUUID(),
        sender: 'agent',
        authorName: 'Agent Restitution Impôts',
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      session.messages.push(agentMsg);
    } else {
      // Si l'admin répond, réinitialiser le compteur non lu
      session.unreadAdminCount = 0;
    }

    saveChatSession(session);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      userMessage: userMsg,
      agentMessage: agentMsg,
      messages: session.messages,
    });
  } catch (error: any) {
    console.error('Erreur API Chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

