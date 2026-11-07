import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { ShieldCheck, HelpCircle, FileSearch, Lock, UserCheck } from 'lucide-react';
import LiveChatWidget from '@/components/LiveChatWidget';

export const metadata: Metadata = {
  title: 'Accompagnement Restitution Impôt sur le Revenu | Service Communautaire France',
  description:
    'Plateforme d’aide et de dépôt simplifié des documents pour percevoir votre restitution d’impôt sur le revenu auprès de l’administration fiscale.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* Barre de réassurance et contact direct */}
        <header className="bg-slate-900 text-white text-xs sm:text-sm py-2 px-4 border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">Permanence d’accompagnement bénévole & communautaire</span>
              <span className="hidden md:inline text-slate-400">| Démarches gratuites & sécurisées</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Données 100% confidentielles
              </span>
              <Link href="/admin" className="text-slate-400 hover:text-white transition flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Espace Conseiller
              </Link>
            </div>
          </div>
        </header>

        {/* Navigation principale */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Restitution Impôts <span className="text-blue-600">Facile</span>
                </span>
                <span className="text-xs text-slate-500 block">Accompagnement communautaire solidaire</span>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/suivi"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 hover:border-blue-600 hover:text-blue-600 text-slate-700 transition bg-white shadow-sm"
              >
                <FileSearch className="w-4 h-4 text-blue-600" />
                <span>Suivre mon dossier</span>
              </Link>

              <Link
                href="/#formulaire"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
              >
                Déposer mon dossier
              </Link>
            </div>
          </div>
        </nav>

        {/* Contenu principal */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-sm py-10 border-t border-slate-800 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  Notre Mission Solidaire
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Service d’aide et d’accompagnement citoyen dans les démarches administratives pour faire valoir vos
                  droits à la restitution de l’impôt sur le revenu auprès de l’administration fiscale française.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">Documents pris en charge</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Pièce d’identité officielle (CNI, Passeport, Séjour)</li>
                  <li>✓ Avis d’imposition 2026 ou ASDIR</li>
                  <li>✓ 3 dernières fiches de paie ou attestations</li>
                  <li>✓ Facture EDF / Justificatif de domicile</li>
                  <li>✓ Relevé d’Identité Bancaire (RIB) pour le virement</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-base mb-3">Sécurité & Confidentialité</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Vos pièces sont stockées dans un espace sécurisé et sont exclusivement utilisées pour la constitution
                  de votre dossier auprès de la DGFiP.
                </p>
                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs text-slate-300">
                  🔒 Conforme RGPD – Aucune transmission à des tiers commerciaux. Vos données restent strictement
                  confidentielles.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Plateforme d’Accompagnement Fiscal Communautaire. Tous droits réservés.</p>
              <div className="flex gap-4">
                <Link href="/suivi" className="hover:text-slate-300 transition">
                  Suivi de dossier
                </Link>
                <Link href="/admin" className="hover:text-slate-300 transition">
                  Accès Conseillers
                </Link>
              </div>
            </div>
          </div>
        </footer>
        {/* Widget Chat en Direct */}
        <LiveChatWidget />
      </body>
    </html>
  );
}

