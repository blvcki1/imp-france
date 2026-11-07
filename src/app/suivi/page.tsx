'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  HelpCircle,
  Phone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

function SuiviContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDossier = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dossiers?code=${encodeURIComponent(codeToSearch.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Dossier introuvable');
      }
      setDossier(data.dossier);
    } catch (err: any) {
      setError(err.message || 'Impossible de trouver ce dossier. Vérifiez l’orthographe du code.');
      setDossier(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchDossier(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDossier(code);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return {
          title: 'Dossier Enregistré',
          subtitle: 'En attente de prise en charge par un conseiller',
          color: 'bg-amber-50 border-amber-200 text-amber-800',
          icon: Clock,
          iconColor: 'text-amber-600',
          stepIndex: 1,
        };
      case 'en_cours':
        return {
          title: 'En cours d’instruction',
          subtitle: 'Un conseiller étudie actuellement vos pièces fiscales',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: FileText,
          iconColor: 'text-blue-600',
          stepIndex: 2,
        };
      case 'pieces_manquantes':
        return {
          title: 'Pièce manquante ou illisible',
          subtitle: 'Une action de votre part est nécessaire',
          color: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: AlertTriangle,
          iconColor: 'text-rose-600',
          stepIndex: 2,
        };
      case 'depose_dgfip':
        return {
          title: 'Démarche transmise aux Impôts (DGFiP)',
          subtitle: 'Votre réclamation officielle a été envoyée au fisc',
          color: 'bg-purple-50 border-purple-200 text-purple-800',
          icon: Send,
          iconColor: 'text-purple-600',
          stepIndex: 3,
        };
      case 'restitution_validee':
        return {
          title: 'Restitution Validée !',
          subtitle: 'Le virement de l’administration fiscale est en cours',
          color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          stepIndex: 4,
        };
      default:
        return {
          title: 'Dossier en traitement',
          subtitle: 'Instruction en cours',
          color: 'bg-slate-50 border-slate-200 text-slate-800',
          icon: Clock,
          iconColor: 'text-slate-600',
          stepIndex: 1,
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* EN-TÊTE DE LA PAGE */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Suivi en direct</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Où en est votre dossier ?</h1>
        <p className="text-slate-500 text-sm">
          Entrez le code unique reçu lors du dépôt (ex: <code>IMP-2026-X8K9P2</code>) pour voir l'avancement.
        </p>
      </div>

      {/* FORMULAIRE DE RECHERCHE */}
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Ex: IMP-2026-XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-base font-bold uppercase tracking-wider shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Vérifier</span>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* RÉSULTAT DU DOSSIER */}
      {dossier && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          {/* HEADER DOSSIER */}
          {(() => {
            const badge = getStatusBadge(dossier.status);
            const BadgeIcon = badge.icon;
            return (
              <div className={`p-6 rounded-2xl border-2 ${badge.color} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${badge.iconColor}`}>
                    <BadgeIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-75">Statut Actuel</span>
                    <h2 className="text-xl sm:text-2xl font-black">{badge.title}</h2>
                    <p className="text-sm font-medium mt-0.5">{badge.subtitle}</p>
                  </div>
                </div>

                <div className="sm:text-right bg-white/70 py-2 px-4 rounded-xl border border-black/5">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Dossier N°</div>
                  <div className="text-lg font-mono font-black text-slate-900">{dossier.codeSuivi}</div>
                </div>
              </div>
            );
          })()}

          {/* TIMELINE DES 4 ÉTAPES */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Progression de la démarche</h3>
            {(() => {
              const currentStep = getStatusBadge(dossier.status).stepIndex;
              const steps = [
                { num: 1, title: 'Dossier déposé', desc: 'Documents transmis avec succès' },
                { num: 2, title: 'Vérification', desc: 'Contrôle des 3 fiches de paie & avis' },
                { num: 3, title: 'Dépôt DGFiP', desc: 'Transmission au centre des impôts' },
                { num: 4, title: 'Restitution', desc: 'Remboursement versé sur votre compte' },
              ];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {steps.map((st) => {
                    const isDone = st.num <= currentStep;
                    const isCurrent = st.num === currentStep;

                    return (
                      <div
                        key={st.num}
                        className={`p-4 rounded-2xl border-2 transition ${
                          isDone
                            ? isCurrent
                              ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                              : 'border-emerald-500 bg-emerald-50/30'
                            : 'border-slate-200 bg-slate-50/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-emerald-600 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {st.num < currentStep ? '✓' : st.num}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{st.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* MESSAGE DU CONSEILLER */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Note de l'équipe d'accompagnement
            </h4>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              « {dossier.statusMessage || 'Votre dossier est en cours de traitement par notre équipe.'} »
            </p>
          </div>

          {/* MONTANT RESTITUÉ SI DISPONIBLE */}
          {dossier.montantRestitue && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Montant de la restitution confirmée</span>
                <p className="text-xs text-emerald-700">Somme en cours de versement par la DGFiP</p>
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                {dossier.montantRestitue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>
          )}

          {/* DOCUMENTS ATTACHÉS AU DOSSIER */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Pièces justificatives enregistrées ({dossier.documentsCount})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dossier.documents && dossier.documents.map((doc: any) => (
                <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.label}</p>
                    <p className="text-[11px] text-slate-400 truncate">{doc.originalName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Chargement du module de suivi...</div>}>
      <SuiviContent />
    </Suspense>
  );
}

