'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Headphones,
} from 'lucide-react';

export default function ContactSection() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [codeSuivi, setCodeSuivi] = useState('');
  const [sujet, setSujet] = useState('Demande de rappel par un conseiller');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !message.trim()) {
      setError('Veuillez renseigner vos nom, prénom, téléphone et votre message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          prenom,
          telephone,
          email,
          codeSuivi,
          sujet,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de l’envoi.');
      }

      setSuccess(true);
      setNom('');
      setPrenom('');
      setTelephone('');
      setEmail('');
      setCodeSuivi('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Impossible d’envoyer votre message pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 scroll-mt-24">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* COLONNE GAUCHE : COORDONNÉES & PERMANENCE */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Headphones className="w-4 h-4 text-emerald-400" />
                Permanence & Assistance Directe
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Besoin d’aide ? Contactez un conseiller
              </h2>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Une question sur vos pièces justificatives, un doute sur votre éligibilité ou besoin d’être rappelé
                pour déposer votre dossier ? Notre équipe vous accompagne gratuitement.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Assistance & Rappel Gratuit
                  </div>
                  <div className="text-base font-black text-white mt-0.5">01 84 80 62 40</div>
                  <div className="text-xs text-emerald-400 font-medium mt-0.5">
                    Appel non surtaxé — Rappel sous 2h ouvrées
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Courriel du Service Instruction
                  </div>
                  <a
                    href="mailto:contact@restitution-impots-france.fr"
                    className="text-sm font-bold text-white hover:text-blue-300 transition block mt-0.5 break-all"
                  >
                    contact@restitution-impots-france.fr
                  </a>
                  <div className="text-xs text-slate-400 mt-0.5">Réponse garantie dans la journée</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Horaires de la Permanence
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">Lundi au Samedi : 08h30 – 19h30</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dépôt de dossier en ligne ouvert 24h/24 et 7j/7</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Antenne Nationale & Coordination
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">Réseau France Services & Régions</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Accompagnement à distance sur toute la France métropolitaine et DOM-TOM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : FORMULAIRE DE CONTACT & DEMANDE DE RAPPEL */}
          <div className="lg:col-span-3 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl">
            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Votre message a bien été transmis !</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Un conseiller de notre permanence a reçu votre demande et vous recontactera très rapidement par
                  téléphone ou par courriel.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Formulaire de contact & demande de rappel
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Remplissez ce formulaire pour être rappelé par un conseiller ou poser une question sur votre dossier.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nom de famille <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MOREAU"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Prénom <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Laurent"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Numéro de téléphone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 06 12 34 56 78"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adresse e-mail <span className="text-slate-400 font-normal">(facultatif)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: laurent.moreau@orange.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Objet de votre demande <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={sujet}
                      onChange={(e) => setSujet(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Demande de rappel par un conseiller">📞 Être rappelé par un conseiller</option>
                      <option value="Aide pour déposer mes documents">📄 Aide pour déposer mes documents</option>
                      <option value="Question sur le suivi de mon dossier">🔍 Question sur le suivi de mon dossier</option>
                      <option value="Vérification d’éligibilité à la restitution">💶 Vérifier mon éligibilité</option>
                      <option value="Autre demande">💬 Autre question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Code de suivi <span className="text-slate-400 font-normal">(si vous en avez un)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: IMP-2026-XXXX"
                      value={codeSuivi}
                      onChange={(e) => setCodeSuivi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votre message ou vos disponibilités pour être rappelé <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Précisez votre question ou le créneau horaire auquel vous souhaitez être rappelé..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Transmission chiffrée — Vos coordonnées restent strictement confidentielles.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-md shadow-blue-500/20 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
