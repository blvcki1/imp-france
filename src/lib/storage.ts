import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Dossier, DossierStatus, DocumentType, StoredDocument, DossierNote } from './types';
import {
  readRemoteJson,
  writeRemoteJson,
  writeRemoteFileBuffer,
  readRemoteFileBuffer,
} from './persistent-db';

const DATA_DIR = path.join(process.cwd(), 'data');
const DOSSIERS_FILE = path.join(DATA_DIR, 'dossiers.json');
const STORAGE_DIR = path.join(DATA_DIR, 'storage', 'dossiers');
const REMOTE_DOSSIERS_PATH = 'data/dossiers.json';

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

function readLocalDossiers(): Dossier[] {
  ensureDirectories();
  try {
    const raw = fs.readFileSync(DOSSIERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalDossiers(dossiers: Dossier[]) {
  ensureDirectories();
  const tempFile = `${DOSSIERS_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(dossiers, null, 2), 'utf-8');
  fs.renameSync(tempFile, DOSSIERS_FILE);
}

/**
 * Récupère tous les dossiers en fusionnant le stockage persistant distant et le disque local
 */
export async function getAllDossiers(): Promise<Dossier[]> {
  ensureDirectories();
  const local = readLocalDossiers();
  const remote = await readRemoteJson<Dossier[]>(REMOTE_DOSSIERS_PATH);

  if (remote && Array.isArray(remote)) {
    // Merge remote and local by ID (prefer newest updatedAt)
    const map = new Map<string, Dossier>();
    for (const d of local) {
      map.set(d.id, d);
    }
    for (const d of remote) {
      const existing = map.get(d.id);
      if (!existing || new Date(d.updatedAt) >= new Date(existing.updatedAt)) {
        map.set(d.id, d);
      }
    }
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    writeLocalDossiers(merged);
    return merged;
  }

  return local;
}

export async function getDossierById(id: string): Promise<Dossier | null> {
  const dossiers = await getAllDossiers();
  return (
    dossiers.find(
      (d) =>
        d.id.toLowerCase() === id.toLowerCase() || d.codeSuivi.toLowerCase() === id.toLowerCase()
    ) || null
  );
}

export async function saveDossier(dossier: Dossier): Promise<Dossier> {
  const dossiers = await getAllDossiers();
  const index = dossiers.findIndex((d) => d.id === dossier.id);

  dossier.updatedAt = new Date().toISOString();

  if (index >= 0) {
    dossiers[index] = dossier;
  } else {
    dossiers.unshift(dossier);
  }

  writeLocalDossiers(dossiers);
  await writeRemoteJson(
    REMOTE_DOSSIERS_PATH,
    dossiers,
    `Save dossier ${dossier.codeSuivi}`
  );

  return dossier;
}

export async function deleteDossier(id: string): Promise<boolean> {
  const dossiers = await getAllDossiers();
  const filtered = dossiers.filter(
    (d) => d.id.toLowerCase() !== id.toLowerCase() && d.codeSuivi.toLowerCase() !== id.toLowerCase()
  );
  if (filtered.length === dossiers.length) return false;

  writeLocalDossiers(filtered);
  await writeRemoteJson(REMOTE_DOSSIERS_PATH, filtered, `Delete dossier ${id}`);
  return true;
}

export function generateDossierCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

  // Sauvegarde persistante distante du fichier
  await writeRemoteFileBuffer(
    `data/storage/${relativePath}`,
    buffer,
    `Upload ${storedFilename} for ${dossierId}`
  );

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
  const safeRelative = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  return path.join(DATA_DIR, 'storage', safeRelative);
}

export async function getDocumentBuffer(relativePath: string): Promise<Buffer | null> {
  const absolutePath = getAbsoluteDocumentPath(relativePath);
  if (fs.existsSync(absolutePath)) {
    return fs.readFileSync(absolutePath);
  }
  const cleanRel = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const remoteBuf = await readRemoteFileBuffer(`data/storage/${cleanRel}`);
  if (remoteBuf) {
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(absolutePath, remoteBuf);
    return remoteBuf;
  }
  return null;
}
