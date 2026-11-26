import { NextRequest, NextResponse } from 'next/server';
import {
  getAllContacts,
  createContactMessage,
  updateContactStatus,
  deleteContactMessage,
} from '@/lib/contact-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const contacts = await getAllContacts();
    return NextResponse.json(
      { contacts },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err) {
    console.error('Erreur GET /api/contact:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, telephone, email, codeSuivi, sujet, message } = body;

    if (!email || !nom || !prenom || !telephone || !message) {
      return NextResponse.json(
        { error: 'Veuillez renseigner votre adresse e-mail, nom, prénom, numéro de téléphone et message.' },
        { status: 400 }
      );
    }

    const contact = await createContactMessage({
      nom: String(nom).trim(),
      prenom: String(prenom).trim(),
      telephone: String(telephone).trim(),
      email: String(email).trim(),
      codeSuivi: codeSuivi ? String(codeSuivi).trim() : '',
      sujet: sujet ? String(sujet).trim() : 'Demande de renseignement',
      message: String(message).trim(),
    });

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (err) {
    console.error('Erreur POST /api/contact:', err);
    return NextResponse.json({ error: 'Impossible d’envoyer votre message.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || (status !== 'nouveau' && status !== 'traite')) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const updated = await updateContactStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Message introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (err) {
    console.error('Erreur PATCH /api/contact:', err);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const deleted = await deleteContactMessage(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Message introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur DELETE /api/contact:', err);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
