'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  User,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function ContactSection() {
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !nom.trim() || !prenom.trim() || !telephone.trim() || !message.trim()) {
      setError('Veuillez renseigner votre adresse e-mail, votre nom, votre prénom, votre numéro et votre message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nom,
          prenom,
          telephone,
          sujet: 'Demande de renseignement',
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de l’envoi.');
      }

      setSuccess(true);
      setEmail('');
      setNom('');
      setPrenom('');
      setTelephone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Impossible d’envoyer votre message pour le moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 scroll-mt-24">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Nous Contacter — Renseignements
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Une question ou une demande de renseignement ?
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Écrivez-nous directement sur la plateforme ci-dessous. Votre message est transmis instantanément dans la
            boîte de réception de nos conseillers qui vous répondront sur votre e-mail ou votre numéro de téléphone.
          </p>
        </div>

        <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Votre demande a bien été reçue !</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Votre message a été enregistré dans notre boîte de réception. Un conseiller va prendre connaissance de
                votre demande et vous recontactera très rapidement aux coordonnées indiquées.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Envoyer un nouveau message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. ADRESSE MAIL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Votre adresse e-mail</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: laurent.moreau@orange.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* 2. NOM ET PRÉNOM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Votre Nom</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MOREAU"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Votre Prénom</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Laurent"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* 3. NUMÉRO SUR LEQUEL VOUS JOINDRE */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Numéro de téléphone sur lequel vous joindre</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 06 12 34 56 78"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* 4. MESSAGE EN DESSOUS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Votre message / Demande de renseignement</span>
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Écrivez votre question ou votre demande de renseignement ici..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Envoi direct dans la boîte de réception de nos conseillers.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-md shadow-blue-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer mon message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
