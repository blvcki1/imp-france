import { NextRequest, NextResponse } from 'next/server';
import { getDossierById, saveDossier } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const dossier = getDossierById(id);
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable.' }, { status: 404, headers: noCacheHeaders });
    }
    return NextResponse.json({ success: true, dossier }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dossier = getDossierById(id);
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable.' }, { status: 404, headers: noCacheHeaders });
    }

    if (body.status) {
      dossier.status = body.status;
    }
    if (body.statusMessage !== undefined) {
      dossier.statusMessage = body.statusMessage;
    }
    if ('restitutionEstimee' in body) {
      dossier.restitutionEstimee = body.restitutionEstimee ?? undefined;
    }
    if ('montantRestitue' in body) {
      dossier.montantRestitue = body.montantRestitue ?? undefined;
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
    return NextResponse.json({ success: true, dossier: updated }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}
