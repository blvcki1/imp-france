import fs from 'fs';
import path from 'path';
import { readRemoteJson, writeRemoteJson } from './persistent-db';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'human_advisor';
  authorName?: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  visitorName?: string;
  dossierCode?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  unreadAdminCount: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');
const REMOTE_CHATS_PATH = 'data/chats.json';

function ensureChatFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CHATS_FILE)) {
    fs.writeFileSync(CHATS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLocalChats(): ChatSession[] {
  ensureChatFile();
  try {
    return JSON.parse(fs.readFileSync(CHATS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalChats(sessions: ChatSession[]) {
  ensureChatFile();
  const tmpFile = `${CHATS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(sessions, null, 2), 'utf-8');
  fs.renameSync(tmpFile, CHATS_FILE);
}

export async function getAllChatSessions(): Promise<ChatSession[]> {
  ensureChatFile();
  const local = readLocalChats();
  const remote = await readRemoteJson<ChatSession[]>(REMOTE_CHATS_PATH);

  if (remote && Array.isArray(remote)) {
    const map = new Map<string, ChatSession>();
    for (const s of local) map.set(s.id, s);
    for (const s of remote) {
      const existing = map.get(s.id);
      if (!existing || s.messages.length >= existing.messages.length) {
        map.set(s.id, s);
      }
    }
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    writeLocalChats(merged);
    return merged;
  }
  return local;
}

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  const sessions = await getAllChatSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

export async function saveChatSession(session: ChatSession): Promise<ChatSession> {
  const sessions = await getAllChatSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);

  session.updatedAt = new Date().toISOString();

  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }

  writeLocalChats(sessions);
  await writeRemoteJson(REMOTE_CHATS_PATH, sessions, `Update chat ${session.id}`);

  return session;
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  const sessions = await getAllChatSessions();
  const filtered = sessions.filter((s) => s.id !== sessionId);
  if (filtered.length === sessions.length) return false;

  writeLocalChats(filtered);
  await writeRemoteJson(REMOTE_CHATS_PATH, filtered, `Delete chat ${sessionId}`);
  return true;
}

/**
 * Moteur de réponse instantanée de l'agent communautaire spécialisé
 */
export function generateInstantAgentReply(userText: string): string {
  const lower = userText.toLowerCase();

  if (
    lower.includes('bonjour') ||
    lower.includes('bonsoir') ||
    lower.includes('salut') ||
    lower.includes('hello')
  ) {
    return "Bonjour et bienvenue ! Je suis votre conseiller d'accompagnement en ligne. Je suis là pour vous aider à préparer votre dossier de restitution d'impôt. Avez-vous une question sur les documents à fournir ou sur vos droits ?";
  }

  if (
    lower.includes('document') ||
    lower.includes('piece') ||
    lower.includes('pièce') ||
    lower.includes('papier') ||
    lower.includes('fournir') ||
    lower.includes('faut quoi')
  ) {
    return "Pour déposer votre dossier sur la plateforme, vous avez seulement besoin de 4 éléments essentiels :\n1. Votre pièce d'identité (CNI, Passeport ou Titre de séjour)\n2. Votre avis d'imposition 2026 (ou le plus récent)\n3. Vos 3 dernières fiches de paie (ou attestations France Travail/CAF)\n4. Une facture EDF ou justificatif de domicile de moins de 3 mois.\n\nVous pouvez simplement les prendre en photo avec votre téléphone !";
  }

  if (
    lower.includes('pas imposable') ||
    lower.includes('non imposable') ||
    lower.includes('gagne peu') ||
    lower.includes('0 euro')
  ) {
    return "Excellente question ! Même si vous n'êtes pas imposable, vous avez tout à fait droit aux crédits d'impôt restituables et à la régularisation des prélèvements à la source. L'administration fiscale vous rembourse directement par virement bancaire.";
  }

  if (
    lower.includes('combien') ||
    lower.includes('montant') ||
    lower.includes('somme') ||
    lower.includes('argent') ||
    lower.includes('remboursement')
  ) {
    return "Le montant restitué dépend de votre situation (revenus, prélèvement à la source, charges, frais ou crédits d'impôt). En moyenne, les dossiers accompagnés obtiennent entre 450 € et 1 850 € de restitution. Déposez vos pièces dans le formulaire pour que nos conseillers calculent votre montant exact gratuitement.";
  }

  if (
    lower.includes('delai') ||
    lower.includes('délai') ||
    lower.includes('quand') ||
    lower.includes('temps')
  ) {
    return "Dès que vous déposez vos documents sur le site, vous recevez immédiatement votre code de suivi (ex: IMP-2026-XXXX). Nos conseillers vérifient votre dossier sous 24h à 48h avant transmission à la DGFiP.";
  }

  if (
    lower.includes('gratuit') ||
    lower.includes('payer') ||
    lower.includes('prix') ||
    lower.includes('tarif')
  ) {
    return "Notre permanence d'accompagnement communautaire est 100% gratuite et solidaire. Aucun frais d'inscription ne vous sera demandé pour constituer et vérifier votre dossier.";
  }

  if (
    lower.includes('suivi') ||
    lower.includes('code') ||
    lower.includes('imp-2026')
  ) {
    return "Pour suivre votre dossier, cliquez sur le bouton « Suivre mon dossier » en haut de la page et entrez le code qui vous a été remis lors de votre dépôt (format IMP-2026-XXXXXX).";
  }

  return "Merci pour votre message ! Je l'ai transmis à notre conseiller de permanence qui suit votre conversation en direct. En attendant, n'hésitez pas à déposer directement vos documents via le formulaire sur la page d'accueil (cela prend 3 minutes) ou à me préciser votre question !";
}
