export type DossierStatus =
  | 'en_attente'
  | 'en_cours'
  | 'pieces_manquantes'
  | 'depose_dgfip'
  | 'restitution_validee'
  | 'cloture';

export type DocumentType =
  | 'identite'
  | 'avis_imposition'
  | 'fiche_paie_1'
  | 'fiche_paie_2'
  | 'fiche_paie_3'
  | 'justificatif_domicile'
  | 'rib'
  | 'autre';

export interface StoredDocument {
  id: string;
  type: DocumentType;
  label: string;
  originalName: string;
  storedFilename: string;
  relativePath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface BeneficiaireInfo {
  civilite: 'M.' | 'Mme';
  nom: string;
  prenom: string;
  dateNaissance?: string;
  telephone: string;
  email?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  numeroFiscal?: string;
  anneeImposition: string;
  situationFamiliale?: string;
  nombreEnfants?: number;
  commentaires?: string;
}

export interface DossierNote {
  id: string;
  date: string;
  auteur: string;
  contenu: string;
}

export interface Dossier {
  id: string; // ex: IMP-2026-X9K3L7
  codeSuivi: string;
  createdAt: string;
  updatedAt: string;
  status: DossierStatus;
  statusMessage: string;
  beneficiaire: BeneficiaireInfo;
  documents: StoredDocument[];
  notesGestionnaire: DossierNote[];
  restitutionEstimee?: number;
  montantRestitue?: number;
  consentementRGPD: boolean;
}

