'use client';

import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  Home,
  FileText,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Copy,
  Check,
  HelpCircle,
  FileCheck,
  Camera,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

interface UploadItem {
  key: string;
  label: string;
  hint: string;
  required: boolean;
  file: File | null;
  previewUrl: string | null;
}

interface UploadBoxProps {
  item: UploadItem;
  onFileChange: (key: string, file: File | null) => void;
  onRemoveFile: (key: string) => void;
}

// COMPOSANT INDÉPENDANT POUR L'UPLOAD DE DOCUMENTS (Hooks React isolés et conformes)
function UploadBox({ item, onFileChange, onRemoveFile }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`p-5 rounded-2xl border-2 transition-all ${
        item.file
          ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
          : 'border-dashed border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 text-base">{item.label}</h4>
            {item.required && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Obligatoire
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{item.hint}</p>
        </div>

        {item.file && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Document prêt
          </span>
        )}
      </div>

      {item.file ? (
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-200 mt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            {item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt="Aperçu"
                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                PDF
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate max-w-xs">{item.file.name}</p>
              <p className="text-xs text-slate-400">{(item.file.size / (1024 * 1024)).toFixed(2)} Mo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemoveFile(item.key)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Supprimer ce document"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleBoxClick}
          className="cursor-pointer py-6 px-4 rounded-xl border border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 text-center transition flex flex-col items-center justify-center gap-2 group"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFileChange(item.key, e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            <span className="text-blue-600 underline">Prendre une photo</span> ou choisir un fichier
          </p>
          <p className="text-xs text-slate-400">Photo nette depuis votre téléphone ou fichier PDF / Image (max 20 Mo)</p>
        </div>
      )}
    </div>
  );
}

export default function DossierForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Données personnelles
  const [formData, setFormData] = useState({
    civilite: 'M.' as 'M.' | 'Mme',
    nom: '',
    prenom: '',
    dateNaissance: '',
    telephone: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: '',
    numeroFiscal: '',
    anneeImposition: '2026',
    situationFamiliale: 'celibataire',
    nombreEnfants: '0',
    commentaires: '',
    consentementRGPD: true,
  });

  // Fichiers
  const [uploads, setUploads] = useState<Record<string, UploadItem>>({
    file_identite: {
      key: 'file_identite',
      label: "1. Pièce d'identité officielle",
      hint: 'Carte Nationale d’Identité (recto/verso), Passeport ou Titre de séjour / Récépissé en cours de validité.',
      required: true,
      file: null,
      previewUrl: null,
    },
    file_avis_imposition: {
      key: 'file_avis_imposition',
      label: "2. Avis d'imposition 2026 (ou récent)",
      hint: 'Avis reçu de la DGFiP ou avis de situation déclarative (ASDIR) téléchargeable sur impots.gouv.fr.',
      required: true,
      file: null,
      previewUrl: null,
    },
    file_fiche_paie_1: {
      key: 'file_fiche_paie_1',
      label: '3. Fiche de paie n°1 (Mois le plus récent)',
      hint: 'Dernier bulletin de salaire ou attestation de versement Pôle Emploi / CAF.',
      required: true,
      file: null,
      previewUrl: null,
    },
    file_fiche_paie_2: {
      key: 'file_fiche_paie_2',
      label: '4. Fiche de paie n°2',
      hint: 'Avant-dernier bulletin de salaire.',
      required: true,
      file: null,
      previewUrl: null,
    },
    file_fiche_paie_3: {
      key: 'file_fiche_paie_3',
      label: '5. Fiche de paie n°3',
      hint: 'Troisième bulletin de salaire.',
      required: true,
      file: null,
      previewUrl: null,
    },
    file_justificatif_domicile: {
      key: 'file_justificatif_domicile',
      label: '6. Facture EDF ou justificatif de domicile',
      hint: 'Facture d’électricité, de gaz, quittance de loyer ou attestation d’hébergement datant de moins de 3 mois.',
      required: true,
      file: null,
      previewUrl: null,
    },
    file_rib: {
      key: 'file_rib',
      label: '7. Relevé d’Identité Bancaire (RIB)',
      hint: 'RIB au nom du bénéficiaire pour que le fisc puisse verser la restitution sur votre compte bancaire.',
      required: false,
      file: null,
      previewUrl: null,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (key: string, file: File | null) => {
    setUploads((prev) => {
      const current = prev[key];
      // Libérer l'ancien URL si existant
      if (current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return {
        ...prev,
        [key]: {
          ...current,
          file,
          previewUrl: file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        },
      };
    });
  };

  const removeFile = (key: string) => {
    handleFileChange(key, null);
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!formData.nom.trim()) {
        setErrorMessage('Veuillez indiquer votre nom de famille.');
        return false;
      }
      if (!formData.prenom.trim()) {
        setErrorMessage('Veuillez indiquer votre prénom.');
        return false;
      }
      if (!formData.telephone.trim() || formData.telephone.length < 8) {
        setErrorMessage('Veuillez indiquer un numéro de téléphone joignable (ex: 06 12 34 56 78).');
        return false;
      }
      if (!formData.ville.trim()) {
        setErrorMessage('Veuillez préciser votre commune ou ville de résidence.');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!uploads.file_identite.file) {
        setErrorMessage('Veuillez prendre en photo ou joindre votre pièce d’identité.');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!uploads.file_avis_imposition.file) {
        setErrorMessage('Veuillez joindre votre avis d’imposition ou document fiscal.');
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (!uploads.file_fiche_paie_1.file || !uploads.file_fiche_paie_2.file || !uploads.file_fiche_paie_3.file) {
        setErrorMessage('Veuillez joindre vos 3 bulletins de salaire (ou attestations de revenus).');
        return false;
      }
      return true;
    }

    if (currentStep === 5) {
      if (!uploads.file_justificatif_domicile.file) {
        setErrorMessage('Veuillez joindre votre facture EDF ou justificatif de domicile récent.');
        return false;
      }
      if (!formData.consentementRGPD) {
        setErrorMessage('Veuillez accepter le traitement sécurisé de vos données pour que nous puissions vous accompagner.');
        return false;
      }
      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, totalSteps + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      // Champs textes
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, String(val));
      });

      // Fichiers
      Object.entries(uploads).forEach(([key, item]) => {
        if (item.file) {
          data.append(key, item.file);
        }
      });

      const response = await fetch('/api/dossiers', {
        method: 'POST',
        body: data,
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || 'Erreur lors de l’envoi de votre dossier.');
      }

      setSubmittedCode(res.codeSuivi);
      setStep(6); // Écran de succès
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore si confetti non supporté
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de l’envoi de votre dossier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (submittedCode) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(submittedCode).catch(() => {});
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };



  // ÉCRAN FINAL : SUCCÈS & CODE ATTRIBUÉ
  if (step === 6 && submittedCode) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-emerald-200">
          Dossier enregistré avec succès !
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Félicitations {formData.prenom} !
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-6">
          Tous vos documents ont été transmis en toute sécurité à notre équipe d’accompagnateurs communautaires.
        </p>

        {/* CARTE CODE DE DOSSIER */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 text-left relative overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Votre Code Unique de Dossier</p>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wider font-mono mt-1">
                {submittedCode}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Conservez précieusement ce code pour suivre l’avancement de votre restitution.
              </p>
            </div>

            <button
              onClick={copyCodeToClipboard}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code copié !' : 'Copier le code'}</span>
            </button>
          </div>
        </div>

        {/* PROCHAINES ÉTAPES */}
        <div className="text-left bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-8 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" /> Que va-t-il se passer maintenant ?
          </h4>
          <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Vérification des pièces</strong> par un conseiller bénévole dans les 24h à 48h.
            </li>
            <li>
              <strong>Calcul du montant estimé</strong> de votre restitution d'impôt sur le revenu.
            </li>
            <li>
              <strong>Assistance à la déclaration / réclamation</strong> auprès de votre centre des impôts (DGFiP).
            </li>
            <li>
              <strong>Notification directe</strong> sur votre téléphone portable ({formData.telephone}) en cas de pièce manquante ou validation.
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/suivi?code=${submittedCode}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm transition shadow-md"
          >
            Suivre l’avancement en direct
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition"
          >
            Imprimer / Enregistrer le reçu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" id="formulaire">
      {/* BARRE DE PROGRESSION VISUELLE */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <span>Étape {step} sur {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% complété</span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Labels des étapes */}
        <div className="grid grid-cols-5 text-center mt-3 text-[11px] font-medium text-slate-500">
          <span className={step >= 1 ? 'text-blue-600 font-bold' : ''}>1. Profil</span>
          <span className={step >= 2 ? 'text-blue-600 font-bold' : ''}>2. Identité</span>
          <span className={step >= 3 ? 'text-blue-600 font-bold' : ''}>3. Impôts 2026</span>
          <span className={step >= 4 ? 'text-blue-600 font-bold' : ''}>4. Fiches Paie</span>
          <span className={step >= 5 ? 'text-blue-600 font-bold' : ''}>5. Domicile & Envoi</span>
        </div>
      </div>

      {/* BOÎTE DU FORMULAIRE */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200">
        {/* MESSAGE D'ERREUR ÉVENTUEL */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Attention :</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ÉTAPE 1 : IDENTITÉ & CONTACT */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Étape 1 sur 5</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Vos coordonnées de base</h2>
              <p className="text-sm text-slate-500">
                Ces informations nous permettront de vous identifier et de vous joindre facilement.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Civilité</label>
                <div className="flex gap-4">
                  {['M.', 'Mme'].map((civ) => (
                    <label
                      key={civ}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer font-semibold text-sm transition ${
                        formData.civilite === civ
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="civilite"
                        value={civ}
                        checked={formData.civilite === civ}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span>{civ === 'M.' ? 'Monsieur' : 'Madame'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    placeholder="Ex: DUPONT"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Prénom(s) *
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    placeholder="Ex: Jean"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Téléphone portable joignable *
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Ex: 06 12 34 56 78"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">Important : c'est sur ce numéro que vous recevrez les alertes.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Adresse Email (facultatif)
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      placeholder="nom@exemple.fr"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Adresse postale
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    placeholder="Numéro et nom de rue"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="codePostal"
                    placeholder="Ex: 75001"
                    maxLength={5}
                    value={formData.codePostal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Ville / Commune *
                  </label>
                  <input
                    type="text"
                    name="ville"
                    placeholder="Ex: Lyon, Paris..."
                    value={formData.ville}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Numéro fiscal (facultatif - 13 chiffres)
                </label>
                <input
                  type="text"
                  name="numeroFiscal"
                  placeholder="Trouvable en haut à gauche de votre avis d'impôt"
                  value={formData.numeroFiscal}
                  onChange={handleInputChange}
                  maxLength={13}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : PIÈCE D'IDENTITÉ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Étape 2 sur 5</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Votre pièce d’identité</h2>
              <p className="text-sm text-slate-500">
                L’administration fiscale exige une pièce officielle pour toute démarche de restitution.
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
              💡 <strong>Conseil photo :</strong> Posez votre document bien à plat dans un endroit éclairé et assurez-vous que les 4 coins et le texte sont bien lisibles.
            </div>

            <UploadBox
              item={uploads.file_identite}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
            />
          </div>
        )}

        {/* ÉTAPE 3 : AVIS D'IMPOSITION 2026 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Étape 3 sur 5</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Avis d’imposition 2026</h2>
              <p className="text-sm text-slate-500">
                Ce document permet à nos conseillers de repérer immédiatement le trop-perçu ou l'absence de crédits d'impôt.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              📌 <strong>Vous n'avez pas l'avis 2026 sous la main ?</strong> Vous pouvez fournir l'avis 2025 ou votre déclaration récente / ASDIR. Nous pourrons tout de même commencer l'étude de votre dossier.
            </div>

            <UploadBox
              item={uploads.file_avis_imposition}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
            />
          </div>
        )}

        {/* ÉTAPE 4 : 3 DERNIÈRES FICHES DE PAIE */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Étape 4 sur 5</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Vos 3 dernières fiches de paie</h2>
              <p className="text-sm text-slate-500">
                Les fiches de paie indiquent le montant exact de prélèvement à la source déjà déduit de votre salaire.
              </p>
            </div>

            <div className="space-y-4">
              <UploadBox
                item={uploads.file_fiche_paie_1}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
              <UploadBox
                item={uploads.file_fiche_paie_2}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
              <UploadBox
                item={uploads.file_fiche_paie_3}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
            </div>
          </div>
        )}

        {/* ÉTAPE 5 : JUSTIFICATIF EDF, RIB & VALIDATION */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Étape 5 sur 5</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Domicile & Coordonnées bancaires</h2>
              <p className="text-sm text-slate-500">
                Dernière étape ! Ces documents permettent de certifier votre adresse et de préparer le versement du fisc.
              </p>
            </div>

            <div className="space-y-4">
              <UploadBox
                item={uploads.file_justificatif_domicile}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
              <UploadBox
                item={uploads.file_rib}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Avez-vous une précision pour nos conseillers ? (facultatif)
                </label>
                <textarea
                  name="commentaires"
                  rows={2}
                  placeholder="Ex : changement d'employeur en cours d'année, enfants à charge, frais kilométriques..."
                  value={formData.commentaires}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                ></textarea>
              </div>

              {/* CONSENTEMENT RGPD */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consentementRGPD"
                    checked={formData.consentementRGPD}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    J’autorise l’équipe bénévole d’accompagnement à consulter mes documents dans le cadre strict de mon
                    dossier de restitution fiscale. Je comprends que mes données sont protégées, ne sont ni vendues ni
                    cédées, et seront conservées uniquement le temps de la démarche.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BOUTONS DE NAVIGATION */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md shadow-blue-500/20"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Envoi sécurisé en cours...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Valider et recevoir mon Code</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

