import { NextRequest, NextResponse } from 'next/server';
import { getDossierById, getDocumentBuffer } from '@/lib/storage';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ dossierId: string; fileId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { dossierId, fileId } = await params;
    const dossier = await getDossierById(dossierId);

    if (!dossier) {
      return new NextResponse('Dossier non trouvé', { status: 404 });
    }

    const doc = dossier.documents.find((d) => d.id === fileId);
    if (!doc) {
      return new NextResponse('Fichier non trouvé', { status: 404 });
    }

    const fileBuffer = await getDocumentBuffer(doc.relativePath);
    if (!fileBuffer) {
      return new NextResponse('Fichier introuvable sur le disque', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === '1';
    const disposition = download ? 'attachment' : 'inline';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(doc.originalName)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Erreur lecture document:', error);
    return new NextResponse('Erreur serveur lors de la récupération du fichier', { status: 500 });
  }
}
