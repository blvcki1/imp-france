import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Dossier, DossierStatus, DocumentType, StoredDocument, DossierNote } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DOSSIERS_FILE = path.join(DATA_DIR, 'dossiers.json');
const STORAGE_DIR = path.join(DATA_DIR, 'storage', 'dossiers');

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
  if (!fs.existsSync(DOSSIERS_FILE)) {
    fs.writeFileSync(DOSSIERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllDossiers(): Dossier[] {
  ensureDirectories();
  try {
    const raw = fs.readFileSync(DOSSIERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading dossiers file:', error);
    return [];
  }
}

export function getDossierById(id: string): Dossier | null {
  const dossiers = getAllDossiers();
  return dossiers.find((d) => d.id.toLowerCase() === id.toLowerCase() || d.codeSuivi.toLowerCase() === id.toLowerCase()) || null;
}

export function saveDossier(dossier: Dossier): Dossier {
  ensureDirectories();
  const dossiers = getAllDossiers();
  const index = dossiers.findIndex((d) => d.id === dossier.id);

  dossier.updatedAt = new Date().toISOString();

  if (index >= 0) {
    dossiers[index] = dossier;
  } else {
    dossiers.unshift(dossier);
  }

  // Atomic write to prevent file corruption
  const tempFile = `${DOSSIERS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dossiers, null, 2), 'utf-8');
  fs.renameSync(tempFile, DOSSIERS_FILE);

  return dossier;
}

export function generateDossierCode(): string {
  // Ex: IMP-2026-X8K9
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O, 0, I, 1 to avoid confusion
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IMP-2026-${suffix}`;
}

export async function saveUploadedFile(
  dossierId: string,
  docType: DocumentType,
  label: string,
  file: File
): Promise<StoredDocument> {
  ensureDirectories();
  const dossierDir = path.join(STORAGE_DIR, dossierId);
  if (!fs.existsSync(dossierDir)) {
    fs.mkdirSync(dossierDir, { recursive: true });
  }

  const fileId = crypto.randomUUID();
  const ext = path.extname(file.name) || '.bin';
  const safeBaseName = file.name
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const storedFilename = `${docType}_${fileId.slice(0, 8)}_${safeBaseName}${ext}`;
  const absolutePath = path.join(dossierDir, storedFilename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(absolutePath, buffer);

  const relativePath = path.join('dossiers', dossierId, storedFilename).replace(/\\/g, '/');

  return {
    id: fileId,
    type: docType,
    label,
    originalName: file.name,
    storedFilename,
    relativePath,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export function getAbsoluteDocumentPath(relativePath: string): string {
  // Prevent directory traversal attacks
  const safeRelative = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(DATA_DIR, 'storage', safeRelative);
}

export function updateDossierStatus(
  id: string,
  status: DossierStatus,
  statusMessage?: string,
  extra?: { restitutionEstimee?: number; montantRestitue?: number }
): Dossier | null {
  const dossier = getDossierById(id);
  if (!dossier) return null;

  dossier.status = status;
  if (statusMessage) {
    dossier.statusMessage = statusMessage;
  }
  if (extra?.restitutionEstimee !== undefined) {
    dossier.restitutionEstimee = extra.restitutionEstimee;
  }
  if (extra?.montantRestitue !== undefined) {
    dossier.montantRestitue = extra.montantRestitue;
  }

  return saveDossier(dossier);
}

export function addDossierNote(
  id: string,
  auteur: string,
  contenu: string
): Dossier | null {
  const dossier = getDossierById(id);
  if (!dossier) return null;

  const note: DossierNote = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    auteur,
    contenu,
  };

  dossier.notesGestionnaire.push(note);
  return saveDossier(dossier);
}

