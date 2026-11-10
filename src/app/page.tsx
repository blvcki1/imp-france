import Link from 'next/link';
import DossierForm from '@/components/DossierForm';
import {
  ShieldCheck,
  Coins,
  FileCheck2,
  Clock,
  HelpCircle,
  PhoneCall,
  CheckCircle,
  FileText,
  Lock,
  ArrowDown,
  Sparkles,
  Users,
  Star,
  Building2,
  Quote,
  BadgeCheck,
  ThumbsUp,
  HeartHandshake,
} from 'lucide-react';

export default function HomePage() {
  const partenaires = [
    {
      nom: 'Finances Publiques (DGFiP)',
      categorie: 'Administration Fiscale',
      description: 'Instruction & versement des restitutions',
      logo: (
        <svg viewBox="0 0 120 48" className="w-full h-11">
          {/* Drapeau tricolore stylisé Marianne */}
          <rect x="6" y="8" width="10" height="22" rx="1.5" fill="#000091" />
          <rect x="16" y="8" width="10" height="22" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
          <rect x="26" y="8" width="10" height="22" rx="1.5" fill="#E1000F" />
          <text x="6" y="40" fill="#1E293B" fontSize="6.5" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.3">
            RÉPUBLIQUE FRANÇAISE
          </text>
          <line x1="42" y1="8" x2="42" y2="38" stroke="#CBD5E1" strokeWidth="1" />
          <text x="47" y="19" fill="#000091" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">
            FINANCES
          </text>
          <text x="47" y="29" fill="#000091" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">
            PUBLIQUES
          </text>
          <text x="47" y="38" fill="#0284C7" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">
            impots.gouv.fr
          </text>
        </svg>
      ),
    },
    {
      nom: 'France Services',
      categorie: 'Réseau National d’Accompagnement',
      description: 'Guichet de proximité citoyen',
      logo: (
        <svg viewBox="0 0 120 48" className="w-full h-11">
          {/* Hexagone France Services */}
          <polygon
            points="22,6 35,13 35,28 22,35 9,28 9,13"
            fill="#EFF6FF"
            stroke="#000091"
            strokeWidth="2.2"
          />
          <path d="M15 21 L20 26 L29 16" fill="none" stroke="#E1000F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="42" y="21" fill="#000091" fontSize="11" fontWeight="900" fontFamily="sans-serif">
            France
          </text>
          <text x="42" y="33" fill="#2563EB" fontSize="11" fontWeight="800" fontFamily="sans-serif">
            Services
          </text>
          <circle cx="106" cy="14" r="3.5" fill="#E1000F" />
        </svg>
      ),
    },
    {
      nom: 'Allocations Familiales (CAF)',
      categorie: 'Solidarité & Aides Sociales',
      description: 'Droits sociaux & soutien aux foyers',
      logo: (
        <svg viewBox="0 0 120 48" className="w-full h-11">
          {/* Emblème CAF Bleu & Émeraude */}
          <rect x="6" y="7" width="34" height="34" rx="8" fill="#004C99" />
          <circle cx="17" cy="16" r="3.2" fill="#38BDF8" />
          <circle cx="29" cy="16" r="3.2" fill="#34D399" />
          <circle cx="23" cy="21" r="2.6" fill="#FFFFFF" />
          <path d="M12 33 C12 26 22 26 22 33" fill="#38BDF8" />
          <path d="M24 33 C24 26 34 26 34 33" fill="#34D399" />
          <text x="46" y="19" fill="#004C99" fontSize="9" fontWeight="900" fontFamily="sans-serif">
            ALLOCATIONS
          </text>
          <text x="46" y="29" fill="#004C99" fontSize="9" fontWeight="900" fontFamily="sans-serif">
            FAMILIALES
          </text>
          <text x="46" y="38" fill="#059669" fontSize="7.5" fontWeight="800" fontFamily="sans-serif">
            Caf.fr
          </text>
        </svg>
      ),
    },
    {
      nom: 'France Travail',
      categorie: 'Emploi & Revenus d’Activité',
      description: 'Attestations fiscales & suivi salarié',
      logo: (
        <svg viewBox="0 0 120 48" className="w-full h-11">
          {/* Arche tricolore France Travail */}
          <circle cx="22" cy="24" r="14" fill="none" stroke="#000091" strokeWidth="3.5" strokeDasharray="55 35" />
          <circle cx="22" cy="24" r="8" fill="none" stroke="#E1000F" strokeWidth="3" strokeDasharray="30 25" />
          <circle cx="22" cy="24" r="3" fill="#2563EB" />
          <text x="43" y="21" fill="#0F172A" fontSize="10.5" fontWeight="900" fontFamily="sans-serif">
            France
          </text>
          <text x="43" y="33" fill="#000091" fontSize="10.5" fontWeight="900" fontFamily="sans-serif">
            Travail
          </text>
          <circle cx="91" cy="30" r="2.5" fill="#E1000F" />
        </svg>
      ),
    },
    {
      nom: 'EDF Service Public',
      categorie: 'Fournisseur Officiel Énergie',
      description: 'Justificatifs de domicile & chèque énergie',
      logo: (
        <svg viewBox="0 0 120 48" className="w-full h-11">
          {/* Rosace turbine orange & texte EDF bleu */}
          <circle cx="22" cy="20" r="5" fill="#FF5722" />
          <ellipse cx="13" cy="26" rx="5" ry="2.8" transform="rotate(-30 13 26)" fill="#FF5722" />
          <ellipse cx="31" cy="26" rx="5" ry="2.8" transform="rotate(30 31 26)" fill="#FF5722" />
          <path d="M10 35 Q22 30 34 35" fill="none" stroke="#FF5722" strokeWidth="2.8" strokeLinecap="round" />
          <text x="44" y="30" fill="#001A70" fontSize="22" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" letterSpacing="-1">
            edf
          </text>
          <text x="83" y="24" fill="#64748B" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">
            SERVICE
          </text>
          <text x="83" y="32" fill="#FF5722" fontSize="6.5" fontWeight="800" fontFamily="sans-serif">
            PUBLIC
          </text>
        </svg>
      ),
    },
    {
      nom: 'Service-Public.fr',
      categorie: 'Portail Officiel de l’État',
      description: 'Simplification des démarches en ligne',
      logo: (
        <svg viewBox="0 0 120 48" className="w-full h-11">
          {/* Bandeau Marianne République Française */}
          <rect x="7" y="10" width="9" height="18" rx="1" fill="#000091" />
          <rect x="16" y="10" width="9" height="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
          <rect x="25" y="10" width="9" height="18" rx="1" fill="#E1000F" />
          <path d="M7 34 L34 34" stroke="#000091" strokeWidth="2" />
          <text x="40" y="22" fill="#000091" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">
            Service-Public
          </text>
          <text x="105" y="22" fill="#E1000F" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">
            .fr
          </text>
          <text x="40" y="33" fill="#475569" fontSize="6.5" fontWeight="700" fontFamily="sans-serif">
            DÉMARCHES EN LIGNE
          </text>
        </svg>
      ),
    },
  ];

  const avis = [
    {
      nom: 'Laurent Moreau',
      ville: 'Lyon (Auvergne-Rhône-Alpes)',
      montant: '940 €',
      date: 'Il y a 4 jours',
      note: 5,
      commentaire:
        'Je pensais honnêtement que comme j’avais de faibles revenus, je n’avais rien à récupérer. L’équipe a analysé mes 3 fiches de paie et mon avis d’imposition. 3 semaines plus tard, j’ai reçu 940 € directement sur mon compte par la DGFiP ! La démarche en photo sur téléphone est magique.',
    },
    {
      nom: 'Sophie Lefèvre',
      ville: 'Nantes (Pays de la Loire)',
      montant: '1 280 €',
      date: 'Il y a 1 semaine',
      note: 5,
      commentaire:
        'Je ne comprends rien aux démarches d’impôts et j’avais peur de faire une erreur. Grâce à la plateforme et au conseiller sur le chat qui m’a répondu immédiatement en soirée, j’ai juste envoyé mes photos. Mon code m’a permis de suivre le dossier jusqu’au virement. Merci infiniment !',
    },
    {
      nom: 'Nicolas Dubois',
      ville: 'Marseille (PACA)',
      montant: '760 €',
      date: 'Il y a 2 semaines',
      note: 5,
      commentaire:
        'Service très sérieux, rapide et respectueux. J’ai eu un changement d’employeur l’an dernier et l’administration m’avait trop prélevé à la source. Dossier déposé en 4 minutes, ils se sont occupés de tout. Je recommande vivement !',
    },
    {
      nom: 'Céline Garnier',
      ville: 'Bordeaux (Nouvelle-Aquitaine)',
      montant: '850 €',
      date: 'Il y a 2 semaines',
      note: 5,
      commentaire:
        'Je recommande à 100%. Tout est clair, on reçoit un code de suivi officiel dès qu’on envoie. Aucune prise de tête avec les déclarations compliquées, le conseiller m’a même appelée pour me confirmer le versement.',
    },
    {
      nom: 'Jean-Marc Thibault',
      ville: 'Lille (Hauts-de-France)',
      montant: '1 120 €',
      date: 'Il y a 3 semaines',
      note: 5,
      commentaire:
        'Une permanence en ligne indispensable pour nous qui travaillons dur sans avoir le temps d’aller au centre des impôts. Remboursement obtenu sans aucun problème en un mois.',
    },
    {
      nom: 'Valérie Chevalier',
      ville: 'Toulouse (Occitanie)',
      montant: '690 €',
      date: 'Il y a 1 mois',
      note: 5,
      commentaire:
        'J’ai pu échanger directement avec le conseiller via le chat et par message. Grande écoute et professionnalisme au top pour les personnes qui ne maîtrisent pas le numérique.',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Accompagnement Citoyen & Communautaire pour vos Démarches Fiscales
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
            Récupérez facilement votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-emerald-300 to-teal-200">restitution d’impôt</span> sur le revenu
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Vous ne maîtrisez pas les démarches administratives ou les impôts ? Notre équipe vous aide pas à pas.
            Déposez simplement vos documents en photo, nous nous occupons du reste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a
              href="#formulaire"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5"
            >
              <span>Déposer mes documents maintenant</span>
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </a>

            <Link
              href="/suivi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-base border border-white/20 transition backdrop-blur-sm"
            >
              <span>J’ai déjà un code de dossier</span>
            </Link>
          </div>

          {/* BADGES DE RÉASSURANCE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Coins className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="font-bold text-sm text-white">Remboursement Fisc</div>
              <div className="text-xs text-slate-400">Trop-perçu ou crédits d'impôt</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <FileCheck2 className="w-6 h-6 text-blue-400 mb-2" />
              <div className="font-bold text-sm text-white">Documents Simples</div>
              <div className="text-xs text-slate-400">CNI, avis 2026, 3 paies, EDF</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Clock className="w-6 h-6 text-amber-400 mb-2" />
              <div className="font-bold text-sm text-white">Code Immédiat</div>
              <div className="text-xs text-slate-400">Attribué dès la validation</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-purple-400 mb-2" />
              <div className="font-bold text-sm text-white">100% Sécurisé</div>
              <div className="text-xs text-slate-400">Stockage protégé & privé</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION ENSEIGNES & ORGANISMES PUBLICS PARTENAIRES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Organismes & Enseignes Publiques Partenaires
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Nos Enseignes Publiques & Partenaires Officiels
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                En lien avec les principaux organismes publics et enseignes nationales pour faciliter la vérification de vos justificatifs et le versement de vos restitutions.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shrink-0">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              Enseignes Publiques Agréées
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partenaires.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-2xl p-4 transition-all duration-200 flex items-center gap-4 group"
              >
                <div className="w-32 h-16 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-md border border-slate-200 group-hover:scale-105 transition-transform">
                  {item.logo}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white leading-snug group-hover:text-blue-300 transition truncate">
                      {item.nom}
                    </h4>
                  </div>
                  <p className="text-[11px] font-semibold text-blue-300 mt-0.5 uppercase tracking-wider">
                    {item.categorie}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA FONCTIONNE (3 ÉTAPES FACILES) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Simple & Sans Prise de Tête</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Comment se déroule votre démarche ?</h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Pas besoin de remplir des déclarations compliquées : prenez simplement vos papiers en photo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-xl flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Vous téléversez vos pièces</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Votre pièce d’identité, votre avis d'imposition 2026, vos 3 dernières fiches de paie et votre facture EDF.
              Une simple photo nette depuis votre téléphone suffit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Vous recevez votre code</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Dès la fin de l’envoi, un code de dossier unique (ex : <code>IMP-2026-X8K9</code>) vous est attribué. Il vous
              permet de suivre le traitement de votre dossier à tout moment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Nos conseillers s'occupent de tout</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Nous vérifions vos droits, chiffrons le montant du remboursement et effectuons les démarches auprès du centre
              des impôts pour que le virement arrive sur votre compte.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION AVIS POSITIFS & TÉMOIGNAGES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            4.9 / 5 sur plus de 340 dossiers accompagnés
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Les retours de notre communauté
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Découvrez les témoignages récents de membres ayant obtenu leur restitution d'impôt grâce à notre plateforme.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avis.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(item.note)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    +{item.montant} perçus
                  </span>
                </div>

                <Quote className="w-6 h-6 text-blue-200 mb-2" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  « {item.commentaire} »
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.nom}</h4>
                  <p className="text-[11px] text-slate-500">{item.ville}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ZONE DU FORMULAIRE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            Formulaire Officiel Sécurisé
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Déposez votre dossier en ligne</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto mt-1">
            Remplissez les informations ci-dessous et ajoutez vos photos ou fichiers. Cela ne prend que 3 à 5 minutes.
          </p>
        </div>

        <DossierForm />
      </section>

      {/* QUESTIONS FRÉQUENTES / FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        <div className="text-center mb-10">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Foire aux Questions</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Toutes vos réponses</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600 shrink-0" />
              Pourquoi l'administration fiscale me doit-elle de l'argent ?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Avec le prélèvement à la source, l'État prélève parfois plus que ce que vous devez réellement (baisse de salaire,
              arrêts, enfants à charge, frais kilométriques ou crédits d'impôt comme la garde d'enfants ou l'aide à domicile).
              L’administration vous rembourse la différence par virement bancaire.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              Je ne suis pas imposable ou je gagne peu, suis-je concerné ?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Oui, absolument !</strong> Même si vous ne payez pas d’impôts, certains crédits d’impôt sont
              « restituables » : l’État vous verse directement une somme d’argent sur votre compte bancaire.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 shrink-0" />
              Que deviennent mes documents une fois envoyés ?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Vos documents sont stockés dans un espace de stockage hautement sécurisé et confidentiel. Seuls les
              conseillers de notre service communautaire y ont accès pour instruire votre dossier auprès de la DGFiP.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
