import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'human_advisor';
  authorName?: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string; // session ID
  visitorName?: string;
  dossierCode?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  unreadAdminCount: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

function ensureChatFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CHATS_FILE)) {
    fs.writeFileSync(CHATS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllChatSessions(): ChatSession[] {
  ensureChatFile();
  try {
    const raw = fs.readFileSync(CHATS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture chats.json:', err);
    return [];
  }
}

export function getChatSession(sessionId: string): ChatSession | null {
  const sessions = getAllChatSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

export function saveChatSession(session: ChatSession): ChatSession {
  ensureChatFile();
  const sessions = getAllChatSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);

  session.updatedAt = new Date().toISOString();

  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }

  const tmpFile = `${CHATS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(sessions, null, 2), 'utf-8');
  fs.renameSync(tmpFile, CHATS_FILE);

  return session;
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
    lower.includes('smic') ||
    lower.includes('faible revenu') ||
    lower.includes('droit')
  ) {
    return "Oui, tout à fait ! Même si vous ne payez aucun impôt, vous pouvez avoir droit à un remboursement : par exemple s'il y a eu des prélèvements à la source sur vos fiches de paie (qui vous seront restitués à 100%), ou si vous avez droit à des crédits d'impôt (garde d'enfants, emploi à domicile, etc.). L'État vous reverse alors directement ces sommes sur votre compte bancaire.";
  }

  if (
    lower.includes('avis') ||
    lower.includes('imposition') ||
    lower.includes('ou trouver') ||
    lower.includes('asdir') ||
    lower.includes('2026')
  ) {
    return "Votre avis d'imposition est disponible sur votre espace particulier sur impots.gouv.fr (rubrique « Mes documents »). Si vous ne l'avez pas encore pour 2026, vous pouvez déposer votre avis 2025 ou votre avis de situation déclarative (ASDIR). Nos conseillers pourront quand même analyser votre dossier !";
  }

  if (
    lower.includes('edf') ||
    lower.includes('domicile') ||
    lower.includes('electricite') ||
    lower.includes('quittance') ||
    lower.includes('hebergement')
  ) {
    return "Pour le justificatif de domicile : une facture EDF (électricité ou gaz) de moins de 3 mois est parfaite. Si vous n'avez pas de facture à votre nom, une quittance de loyer ou une attestation d'hébergement signée avec la pièce d'identité de votre hébergeant est également acceptée.";
  }

  if (
    lower.includes('code') ||
    lower.includes('suivi') ||
    lower.includes('numero') ||
    lower.includes('retrouver')
  ) {
    return "Dès que vous validez l'envoi de vos documents sur la page d'accueil, un code unique au format IMP-2026-XXXXXX s'affiche immédiatement. Vous pouvez ensuite vous rendre sur l'onglet 'Suivre mon dossier' en haut du site pour vérifier l'avancement en direct.";
  }

  if (
    lower.includes('gratuit') ||
    lower.includes('payant') ||
    lower.includes('combien') ||
    lower.includes('tarif') ||
    lower.includes('prix')
  ) {
    return "Notre accompagnement communautaire est un service solidaire d'aide aux démarches. Le dépôt de vos documents et l'analyse de votre dossier sont entièrement pris en charge par notre collectif pour vous aider à faire valoir vos droits.";
  }

  if (
    lower.includes('delai') ||
    lower.includes('délai') ||
    lower.includes('combien de temps') ||
    lower.includes('quand')
  ) {
    return "Dès réception, nos conseillers vérifient vos pièces sous 24h à 48h ouvrées. Une fois la demande ou réclamation déposée auprès de la DGFiP (Finances Publiques), le délai moyen de virement constaté varie de 2 à 4 semaines selon votre centre des impôts.";
  }

  if (
    lower.includes('rib') ||
    lower.includes('compte') ||
    lower.includes('banque') ||
    lower.includes('virement')
  ) {
    return "Le RIB doit être au nom du bénéficiaire principal. C'est sur ce compte bancaire que l'administration fiscale effectuera directement le virement de la restitution.";
  }

  // Réponse par défaut chaleureuse et orientée action
  return "Bien reçu ! Votre question est enregistrée. Si vous souhaitez déposer vos pièces pour vérification, il vous suffit de remplir le formulaire sur la page principale avec vos 4 documents (Pièce d'identité, Avis 2026, 3 fiches de paie, Facture EDF). Un conseiller humain de la permanence consulte également vos messages ici.";
}

