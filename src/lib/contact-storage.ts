import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ContactMessage {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  codeSuivi?: string;
  sujet: string;
  message: string;
  status: 'nouveau' | 'traite';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

function ensureContactsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllContacts(): ContactMessage[] {
  ensureContactsFile();
  try {
    const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture contacts.json:', err);
    return [];
  }
}

export function createContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
): ContactMessage {
  ensureContactsFile();
  const contacts = getAllContacts();

  const newContact: ContactMessage = {
    ...data,
    id: crypto.randomUUID(),
    status: 'nouveau',
    createdAt: new Date().toISOString(),
  };

  contacts.unshift(newContact);

  const tmpFile = `${CONTACTS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(contacts, null, 2), 'utf-8');
  fs.renameSync(tmpFile, CONTACTS_FILE);

  return newContact;
}

export function updateContactStatus(id: string, status: 'nouveau' | 'traite'): ContactMessage | null {
  ensureContactsFile();
  const contacts = getAllContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;

  contacts[index].status = status;

  const tmpFile = `${CONTACTS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(contacts, null, 2), 'utf-8');
  fs.renameSync(tmpFile, CONTACTS_FILE);

  return contacts[index];
}
