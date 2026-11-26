import { NextRequest, NextResponse } from 'next/server';
import {
  getAllChatSessions,
  getChatSession,
  saveChatSession,
  deleteChatSession,
  generateInstantAgentReply,
  ChatSession,
  ChatMessage,
} from '@/lib/chat-storage';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const session = await getChatSession(sessionId);
      if (!session) {
        return NextResponse.json({ success: true, messages: [] }, { headers: noCacheHeaders });
      }
      return NextResponse.json({ success: true, session }, { headers: noCacheHeaders });
    }

    const sessions = await getAllChatSessions();
    return NextResponse.json({ success: true, sessions }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requis' }, { status: 400, headers: noCacheHeaders });
    }

    const session = await getChatSession(sessionId);
    if (session && session.unreadAdminCount > 0) {
      session.unreadAdminCount = 0;
      await saveChatSession(session);
    }

    return NextResponse.json({ success: true, session }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, text, sender, authorName, dossierCode } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Le message ne peut pas être vide' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const currentSessionId = sessionId || `chat_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
    let session = await getChatSession(currentSessionId);

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

    if (sender !== 'admin') {
      session.unreadAdminCount = (session.unreadAdminCount || 0) + 1;

      const hasHumanAdvisorReplied = session.messages.some((m) => m.sender === 'human_advisor');

      if (!hasHumanAdvisorReplied) {
        const autoReplyText = generateInstantAgentReply(text);
        const agentMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'agent',
          authorName: 'Assistant Restitution Impôts',
          text: autoReplyText,
          timestamp: new Date(Date.now() + 500).toISOString(),
        };
        session.messages.push(agentMsg);
      }
    } else {
      session.unreadAdminCount = 0;
    }

    await saveChatSession(session);

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        messages: session.messages,
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Erreur API Chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requis' }, { status: 400, headers: noCacheHeaders });
    }
    const deleted = await deleteChatSession(sessionId);
    if (!deleted) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404, headers: noCacheHeaders });
    }
    return NextResponse.json({ success: true }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}
