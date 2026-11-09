import { NextRequest, NextResponse } from 'next/server';
import {
  saveDossier,
  saveUploadedFile,
  generateDossierCode,
  getAllDossiers,
  getDossierById,
} from '@/lib/storage';
import { Dossier, DocumentType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// POST: Soumission d'un nouveau dossier par le bénéficiaire
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nom = ((formData.get('nom') as string) || '').trim().toUpperCase();
    const prenom = ((formData.get('prenom') as string) || '').trim();
    const telephone = ((formData.get('telephone') as string) || '').trim();

    if (!nom || !prenom || !telephone) {
      return NextResponse.json(
        { error: 'Le nom, le prénom et le numéro de téléphone sont obligatoires.' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const dossierId = generateDossierCode();
    const codeSuivi = dossierId; // Le code de suivi est le code unique du dossier

    // Sauvegarde des documents uploadés
    const docDefinitions: { key: string; type: DocumentType; label: string }[] = [
      { key: 'file_identite', type: 'identite', label: "Pièce d'identité (CNI / Passeport / Séjour)" },
      { key: 'file_avis_imposition', type: 'avis_imposition', label: "Avis d'imposition 2026 / Récent" },
      { key: 'file_fiche_paie_1', type: 'fiche_paie_1', label: 'Bulletin de paie (Mois 1)' },
      { key: 'file_fiche_paie_2', type: 'fiche_paie_2', label: 'Bulletin de paie (Mois 2)' },
      { key: 'file_fiche_paie_3', type: 'fiche_paie_3', label: 'Bulletin de paie (Mois 3)' },
      { key: 'file_justificatif_domicile', type: 'justificatif_domicile', label: 'Justificatif de domicile (EDF / Énergie)' },
      { key: 'file_rib', type: 'rib', label: "Relevé d'Identité Bancaire (RIB)" },
    ];

    const storedDocuments = [];

    for (const def of docDefinitions) {
      const file = formData.get(def.key);
      if (file && typeof file === 'object' && 'name' in file && (file as File).size > 0) {
        const storedDoc = await saveUploadedFile(dossierId, def.type, def.label, file as File);
        storedDocuments.push(storedDoc);
      }
    }

    // Création du dossier complet
    const nouveauDossier: Dossier = {
      id: dossierId,
      codeSuivi,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'en_attente',
      statusMessage:
        'Votre dossier a été enregistré avec succès. Un conseiller va vérifier vos pièces sous 48h ouvrées.',
      beneficiaire: {
        civilite: (formData.get('civilite') as 'M.' | 'Mme') || 'M.',
        nom,
        prenom,
        dateNaissance: (formData.get('dateNaissance') as string) || undefined,
        telephone,
        email: (formData.get('email') as string) || undefined,
        adresse: ((formData.get('adresse') as string) || '').trim(),
        codePostal: ((formData.get('codePostal') as string) || '').trim(),
        ville: ((formData.get('ville') as string) || '').trim(),
        numeroFiscal: (formData.get('numeroFiscal') as string) || undefined,
        anneeImposition: (formData.get('anneeImposition') as string) || '2026',
        situationFamiliale: (formData.get('situationFamiliale') as string) || undefined,
        nombreEnfants: formData.get('nombreEnfants')
          ? parseInt(formData.get('nombreEnfants') as string, 10)
          : undefined,
        commentaires: (formData.get('commentaires') as string) || undefined,
      },
      documents: storedDocuments,
      notesGestionnaire: [
        {
          id: 'initial',
          date: new Date().toISOString(),
          auteur: 'Système',
          contenu: `Dossier créé en ligne avec ${storedDocuments.length} document(s) joint(s).`,
        },
      ],
      consentementRGPD: formData.get('consentementRGPD') === 'true',
    };

    saveDossier(nouveauDossier);

    return NextResponse.json(
      {
        success: true,
        dossierId,
        codeSuivi,
        documentsCount: storedDocuments.length,
        message: 'Dossier créé avec succès.',
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    console.error('Erreur création dossier:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du dossier: ' + (error?.message || 'Erreur interne') },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// GET: Récupération des dossiers (avec filtre éventuel par code pour le suivi public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const dossier = getDossierById(code.trim());
      if (!dossier) {
        return NextResponse.json(
          { error: 'Aucun dossier trouvé pour ce code.' },
          { status: 404, headers: noCacheHeaders }
        );
      }
      // Pour le suivi public, on masque certaines données confidentielles si besoin
      return NextResponse.json(
        {
          success: true,
          dossier: {
            id: dossier.id,
            codeSuivi: dossier.codeSuivi,
            createdAt: dossier.createdAt,
            updatedAt: dossier.updatedAt,
            status: dossier.status,
            statusMessage: dossier.statusMessage,
            beneficiaireNom: `${dossier.beneficiaire.prenom} ${dossier.beneficiaire.nom.charAt(0)}.`,
            documentsCount: dossier.documents.length,
            documents: dossier.documents.map((d) => ({
              id: d.id,
              type: d.type,
              label: d.label,
              originalName: d.originalName,
              uploadedAt: d.uploadedAt,
            })),
            restitutionEstimee: dossier.restitutionEstimee,
            montantRestitue: dossier.montantRestitue,
          },
        },
        { headers: noCacheHeaders }
      );
    }

    // Liste complète pour l'admin
    const dossiers = getAllDossiers();
    return NextResponse.json(
      {
        success: true,
        dossiers,
      },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur' },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
