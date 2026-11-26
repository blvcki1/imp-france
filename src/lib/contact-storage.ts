import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { readRemoteJson, writeRemoteJson } from './persistent-db';

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
const REMOTE_CONTACTS_PATH = 'data/contacts.json';

function ensureContactsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readLocalContacts(): ContactMessage[] {
  ensureContactsFile();
  try {
    return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalContacts(contacts: ContactMessage[]) {
  ensureContactsFile();
  const tmpFile = `${CONTACTS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(contacts, null, 2), 'utf-8');
  fs.renameSync(tmpFile, CONTACTS_FILE);
}

export async function getAllContacts(): Promise<ContactMessage[]> {
  ensureContactsFile();
  const local = readLocalContacts();
  const remote = await readRemoteJson<ContactMessage[]>(REMOTE_CONTACTS_PATH);

  if (remote && Array.isArray(remote)) {
    const map = new Map<string, ContactMessage>();
    for (const c of local) map.set(c.id, c);
    for (const c of remote) map.set(c.id, c);
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    writeLocalContacts(merged);
    return merged;
  }
  return local;
}

export async function createContactMessage(
  data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
): Promise<ContactMessage> {
  const contacts = await getAllContacts();

  const newContact: ContactMessage = {
    ...data,
    id: crypto.randomUUID(),
    status: 'nouveau',
    createdAt: new Date().toISOString(),
  };

  contacts.unshift(newContact);
  writeLocalContacts(contacts);
  await writeRemoteJson(REMOTE_CONTACTS_PATH, contacts, `New contact from ${data.nom}`);

  return newContact;
}

export async function updateContactStatus(
  id: string,
  status: 'nouveau' | 'traite'
): Promise<ContactMessage | null> {
  const contacts = await getAllContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;

  contacts[index].status = status;
  writeLocalContacts(contacts);
  await writeRemoteJson(REMOTE_CONTACTS_PATH, contacts, `Update contact ${id}`);

  return contacts[index];
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const contacts = await getAllContacts();
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length === contacts.length) return false;

  writeLocalContacts(filtered);
  await writeRemoteJson(REMOTE_CONTACTS_PATH, filtered, `Delete contact ${id}`);
  return true;
}
