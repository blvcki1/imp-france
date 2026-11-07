import { NextRequest, NextResponse } from 'next/server';
import { getDossierById, updateDossierStatus, addDossierNote, saveDossier, getAllDossiers } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const dossier = getDossierById(id);
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, dossier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dossier = getDossierById(id);
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable.' }, { status: 404 });
    }

    if (body.status) {
      dossier.status = body.status;
    }
    if (body.statusMessage !== undefined) {
      dossier.statusMessage = body.statusMessage;
    }
    if (body.restitutionEstimee !== undefined) {
      dossier.restitutionEstimee = body.restitutionEstimee;
    }
    if (body.montantRestitue !== undefined) {
      dossier.montantRestitue = body.montantRestitue;
    }
    if (body.newNote && body.newNote.contenu) {
      dossier.notesGestionnaire.push({
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        auteur: body.newNote.auteur || 'Gestionnaire',
        contenu: body.newNote.contenu,
      });
    }

    const updated = saveDossier(dossier);
    return NextResponse.json({ success: true, dossier: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

