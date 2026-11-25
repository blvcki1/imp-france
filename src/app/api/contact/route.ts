import { NextRequest, NextResponse } from 'next/server';
import { getAllContacts, createContactMessage, updateContactStatus } from '@/lib/contact-storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const contacts = getAllContacts();
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

    if (!nom || !prenom || !telephone || !sujet || !message) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    const contact = createContactMessage({
      nom: String(nom).trim(),
      prenom: String(prenom).trim(),
      telephone: String(telephone).trim(),
      email: email ? String(email).trim() : '',
      codeSuivi: codeSuivi ? String(codeSuivi).trim() : '',
      sujet: String(sujet).trim(),
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

    const updated = updateContactStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Message introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, contact: updated });
  } catch (err) {
    console.error('Erreur PATCH /api/contact:', err);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}
