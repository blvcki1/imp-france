'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Coins,
  ChevronRight,
  X,
  MessageSquare,
  Lock,
  RefreshCw,
  Plus,
  ExternalLink,
  MessageCircle,
  UserCheck,
  Copy,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { Dossier, DossierStatus } from '@/lib/types';
import { ChatSession } from '@/lib/chat-storage';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);

  // Onglet actif : 'dossiers' ou 'chats'
  const [activeTab, setActiveTab] = useState<'dossiers' | 'chats'>('dossiers');

  // DOSSIERS
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [copiedInfo, setCopiedInfo] = useState(false);

  // Édition dossier
  const [newStatus, setNewStatus] = useState<DossierStatus>('en_attente');
  const [newStatusMessage, setNewStatusMessage] = useState('');
  const [montantRestitue, setMontantRestitue] = useState<string>('');
  const [restitutionEstimee, setRestitutionEstimee] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [authorName, setAuthorName] = useState('Conseiller');
  const [isUpdating, setIsUpdating] = useState(false);

  // CHAT SESSIONS
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '2026' || pinCode === 'admin2026') {
      setIsAuthenticated(true);
      setPinError(false);
      fetchDossiers();
      fetchChatSessions();
    } else {
      setPinError(true);
    }
  };

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dossiers');
      const data = await res.json();
      if (res.ok) {
        setDossiers(data.dossiers || []);
      }
    } catch (err) {
      console.error('Erreur chargement dossiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (res.ok && data.sessions) {
        setChatSessions(data.sessions);
        if (selectedChat) {
          const updated = data.sessions.find((s: ChatSession) => s.id === selectedChat.id);
          if (updated) setSelectedChat(updated);
        }
      }
    } catch (err) {
      console.error('Erreur chargement sessions chat:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDossiers();
      fetchChatSessions();
      const interval = setInterval(() => {
        fetchChatSessions();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const openDossierDetail = (dossier: Dossier) => {
    setSelectedDossier(dossier);
    setNewStatus(dossier.status);
    setNewStatusMessage(dossier.statusMessage || '');
    setMontantRestitue(dossier.montantRestitue ? String(dossier.montantRestitue) : '');
    setRestitutionEstimee(dossier.restitutionEstimee ? String(dossier.restitutionEstimee) : '');
    setCopiedInfo(false);
  };

  const handleCopyBeneficiaire = () => {
    if (!selectedDossier) return;
    const b = selectedDossier.beneficiaire;
    const text = `DOSSIER: ${selectedDossier.codeSuivi}
NOM: ${b.civilite} ${b.nom} ${b.prenom}
TÉL: ${b.telephone}
EMAIL: ${b.email || 'N/A'}
ADRESSE: ${b.adresse || ''} ${b.codePostal || ''} ${b.ville}
NUMÉRO FISCAL: ${b.numeroFiscal || 'N/A'}
DATE DÉPÔT: ${new Date(selectedDossier.createdAt).toLocaleDateString('fr-FR')}`;

    navigator.clipboard.writeText(text);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 3000);
  };

  // EXPORT EXCEL / CSV DE TOUS LES CONTACTS
  const exportToCSV = () => {
    if (dossiers.length === 0) {
      alert('Aucun dossier à exporter.');
      return;
    }
    const headers = [
      'Code Dossier',
      'Civilité',
      'Nom',
      'Prénom',
      'Téléphone',
      'Email',
      'Adresse',
      'Code Postal',
      'Ville',
      'Numéro Fiscal',
      'Année Imposition',
      'Statut',
      'Date Dépôt',
      'Nb Documents',
      'Restitution Estimée',
      'Restitution Réelle',
    ];

    const rows = dossiers.map((d) => [
      `"${d.codeSuivi}"`,
      `"${d.beneficiaire.civilite}"`,
      `"${d.beneficiaire.nom}"`,
      `"${d.beneficiaire.prenom}"`,
      `"${d.beneficiaire.telephone}"`,
      `"${d.beneficiaire.email || ''}"`,
      `"${d.beneficiaire.adresse || ''}"`,
      `"${d.beneficiaire.codePostal || ''}"`,
      `"${d.beneficiaire.ville || ''}"`,
      `"${d.beneficiaire.numeroFiscal || ''}"`,
      `"${d.beneficiaire.anneeImposition || '2026'}"`,
      `"${d.status}"`,
      `"${new Date(d.createdAt).toLocaleDateString('fr-FR')}"`,
      `"${d.documents.length}"`,
      `"${d.restitutionEstimee || ''}"`,
      `"${d.montantRestitue || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dossiers_restitution_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateDossier = async () => {
    if (!selectedDossier) return;
    setIsUpdating(true);

    try {
      const payload: any = {
        status: newStatus,
        statusMessage: newStatusMessage,
        restitutionEstimee: restitutionEstimee ? parseFloat(restitutionEstimee) : undefined,
        montantRestitue: montantRestitue ? parseFloat(montantRestitue) : undefined,
      };

      if (newNoteContent.trim()) {
        payload.newNote = {
          auteur: authorName.trim() || 'Conseiller',
          contenu: newNoteContent.trim(),
        };
      }

      const res = await fetch(`/api/dossiers/${selectedDossier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.dossier) {
        setSelectedDossier(data.dossier);
        setNewNoteContent('');
        fetchDossiers();
      }
    } catch (err) {
      console.error('Erreur mise à jour dossier:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !adminReplyText.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedChat.id,
          text: adminReplyText.trim(),
          sender: 'admin',
          authorName: authorName || 'Conseiller Humain',
        }),
      });

      const data = await res.json();
      if (res.ok && data.messages) {
        setSelectedChat((prev) => (prev ? { ...prev, messages: data.messages } : null));
        setAdminReplyText('');
        fetchChatSessions();
      }
    } catch (err) {
      console.error('Erreur envoi réponse conseiller:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.codeSuivi.toLowerCase().includes(search.toLowerCase()) ||
      d.beneficiaire.nom.toLowerCase().includes(search.toLowerCase()) ||
      d.beneficiaire.prenom.toLowerCase().includes(search.toLowerCase()) ||
      d.beneficiaire.telephone.includes(search) ||
      d.beneficiaire.ville.toLowerCase().includes(search.toLowerCase()) ||
      (d.beneficiaire.email && d.beneficiaire.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DossierStatus) => {
    switch (status) {
      case 'en_attente':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">En attente</span>;
      case 'en_cours':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">En instruction</span>;
      case 'pieces_manquantes':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Pièces manquantes</span>;
      case 'depose_dgfip':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Déposé DGFiP</span>;
      case 'restitution_validee':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Restitution validée</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  // ÉCRAN DE VERROUILLAGE
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">Espace Conseillers</h1>
            <p className="text-slate-500 text-xs mt-1">
              Accès réservé aux membres et coordinateurs pour consulter les coordonnées et pièces.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Code d’accès sécurisé
              </label>
              <input
                type="password"
                placeholder="Code PIN (ex: 2026)"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
              {pinError && <p className="text-rose-600 text-xs font-semibold mt-1">Code incorrect. Réessayez.</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md shadow-blue-500/20"
            >
              Déverrouiller l’espace de gestion
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            Note : Le code PIN par défaut est <strong>2026</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* HEADER GESTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Tableau de bord Communautaire</span>
          <h1 className="text-2xl font-black text-slate-900">Coordonnées & Dossiers de Restitution</h1>
          <p className="text-xs text-slate-500">
            Accès sécurisé à toutes les coordonnées des bénéficiaires, pièces d'identité et bulletins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            title="Télécharger la liste complète des coordonnées en format Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter en Excel / CSV</span>
          </button>

          <button
            onClick={() => {
              fetchDossiers();
              fetchChatSessions();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Verrouiller
          </button>
        </div>
      </div>

      {/* ONGLETS DOSSIERS VS CHATS */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition ${
            activeTab === 'dossiers'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Dossiers & Coordonnées ({dossiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition relative ${
            activeTab === 'chats'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Live Chat & Messages ({chatSessions.length})</span>
          {chatSessions.some((s) => (s.unreadAdminCount || 0) > 0) && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>
      </div>

      {/* VUE 1 : DOSSIERS & COORDONNÉES */}
      {activeTab === 'dossiers' && (
        <div className="space-y-6">
          {/* STATISTIQUES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-400">Total Personnes</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{dossiers.length}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-amber-600">En attente</div>
              <div className="text-3xl font-black text-amber-600 mt-1">
                {dossiers.filter((d) => d.status === 'en_attente').length}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-purple-600">Déposés DGFiP</div>
              <div className="text-3xl font-black text-purple-600 mt-1">
                {dossiers.filter((d) => d.status === 'depose_dgfip').length}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-emerald-600">Restitutions Validées</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                {dossiers.filter((d) => d.status === 'restitution_validee').length}
              </div>
            </div>
          </div>

          {/* RECHERCHE & FILTRE */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, ville, email ou code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En instruction</option>
                <option value="pieces_manquantes">Pièces manquantes</option>
                <option value="depose_dgfip">Déposé DGFiP</option>
                <option value="restitution_validee">Restitution validée</option>
              </select>
            </div>
          </div>

          {/* TABLEAU DES DOSSIERS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">Nom & Prénom</th>
                    <th className="py-3.5 px-4">Contact Direct (Tél / Email)</th>
                    <th className="py-3.5 px-4">Ville / Adresse</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4">Documents</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDossiers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        Aucun dossier ne correspond à votre recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredDossiers.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => openDossierDetail(d)}
                        className="hover:bg-blue-50/50 cursor-pointer transition"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-blue-600">{d.codeSuivi}</td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {d.beneficiaire.civilite} {d.beneficiaire.nom} {d.beneficiaire.prenom}
                          </div>
                          {d.beneficiaire.numeroFiscal && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              N° Fiscal: <span className="font-semibold text-slate-700">{d.beneficiaire.numeroFiscal}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <a
                            href={`tel:${d.beneficiaire.telephone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{d.beneficiaire.telephone}</span>
                          </a>
                          {d.beneficiaire.email && (
                            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                              {d.beneficiaire.email}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{d.beneficiaire.ville}</span>
                          </div>
                          {d.beneficiaire.adresse && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {d.beneficiaire.adresse}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(d.status)}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                            {d.documents.length} doc(s)
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-xs">
                          {new Date(d.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDossierDetail(d);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition"
                          >
                            <span>Voir dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VUE 2 : LIVE CHAT & CONVERSATIONS */}
      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 min-h-[550px]">
          <div className="border-r border-slate-200 pr-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center justify-between">
              <span>Conversations ({chatSessions.length})</span>
              <button
                onClick={fetchChatSessions}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
              >
                Actualiser
              </button>
            </h3>

            {chatSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Aucune conversation pour le moment.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[500px]">
                {chatSessions.map((session) => {
                  const isSelected = selectedChat?.id === session.id;
                  const lastMsg = session.messages[session.messages.length - 1];

                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedChat(session)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition border ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs text-slate-900 truncate max-w-[140px]">
                          Visiteur #{session.id.slice(-6)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {lastMsg && (
                        <p className="text-xs text-slate-500 truncate">
                          <strong className="text-slate-700">{lastMsg.authorName || lastMsg.sender}:</strong>{' '}
                          {lastMsg.text}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{session.messages.length} message(s)</span>
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          En direct
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col h-[500px]">
            {selectedChat ? (
              <>
                <div className="pb-3 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Session Visiteur : <span className="font-mono text-blue-600">{selectedChat.id}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      L'agent instantané répond automatiquement, mais vous pouvez intervenir manuellement à tout moment.
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 rounded-2xl my-3 text-xs">
                  {selectedChat.messages.map((m) => {
                    const isUser = m.sender === 'user';
                    const isHuman = m.sender === 'human_advisor';

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        <span className="text-[10px] text-slate-400 px-1 mb-0.5">
                          {isUser
                            ? 'Bénéficiaire (Visiteur)'
                            : isHuman
                            ? `Conseiller Humain (${m.authorName || 'Vous'})`
                            : 'Agent Automatique Restitution'}
                        </span>
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                            isUser
                              ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                              : isHuman
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-blue-600 text-white rounded-br-xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendAdminChat} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Écrivez une réponse directe au bénéficiaire..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !adminReplyText.trim()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Répondre en direct</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                <MessageCircle className="w-12 h-12 text-slate-300" />
                <p>Sélectionnez une conversation sur la gauche pour lire les échanges ou intervenir.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TIROIR MODAL DE DÉTAIL DU DOSSIER & COORDONNÉES */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            {/* EN-TÊTE MODALE */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-blue-600 text-lg">{selectedDossier.codeSuivi}</span>
                  {getStatusBadge(selectedDossier.status)}
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedDossier.beneficiaire.civilite} {selectedDossier.beneficiaire.nom}{' '}
                  {selectedDossier.beneficiaire.prenom}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* CONTENU MODALE */}
            <div className="p-6 space-y-6 flex-1">
              {/* FICHE COORDONNÉES COMPLÈTE */}
              <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-3xl border border-blue-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Coordonnées du Bénéficiaire
                  </h3>

                  <button
                    onClick={handleCopyBeneficiaire}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-blue-700 font-bold text-xs shadow-xs transition"
                  >
                    {copiedInfo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInfo ? 'Copié !' : 'Copier les infos'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {/* TÉLÉPHONE */}
                  <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Numéro de Téléphone</span>
                    <div className="flex items-center justify-between mt-1">
                      <a
                        href={`tel:${selectedDossier.beneficiaire.telephone}`}
                        className="font-black text-blue-600 text-base hover:underline"
                      >
                        {selectedDossier.beneficiaire.telephone}
                      </a>
                      <a
                        href={`https://wa.me/${selectedDossier.beneficiaire.telephone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full hover:bg-emerald-200 transition"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Adresse Email</span>
                    <div className="mt-1">
                      {selectedDossier.beneficiaire.email ? (
                        <a
                          href={`mailto:${selectedDossier.beneficiaire.email}`}
                          className="font-bold text-slate-800 hover:text-blue-600 truncate block"
                        >
                          {selectedDossier.beneficiaire.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Non renseignée</span>
                      )}
                    </div>
                  </div>

                  {/* ADRESSE POSTALE */}
                  <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Adresse Postale</span>
                    <p className="font-semibold text-slate-800 mt-1">
                      {selectedDossier.beneficiaire.adresse ? `${selectedDossier.beneficiaire.adresse}, ` : ''}
                      {selectedDossier.beneficiaire.codePostal ? `${selectedDossier.beneficiaire.codePostal} ` : ''}
                      <span className="font-black text-slate-900">{selectedDossier.beneficiaire.ville}</span>
                    </p>
                  </div>

                  {/* NUMÉRO FISCAL */}
                  <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Numéro Fiscal (13 chiffres)</span>
                    <p className="font-mono font-black text-slate-900 text-sm mt-1">
                      {selectedDossier.beneficiaire.numeroFiscal || 'Non précisé'}
                    </p>
                  </div>

                  {/* ANNÉE & DATE DÉPÔT */}
                  <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-xs">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Date de dépôt</span>
                    <p className="font-medium text-slate-800 mt-1">
                      {new Date(selectedDossier.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {selectedDossier.beneficiaire.commentaires && (
                  <div className="bg-white p-3.5 rounded-2xl border border-blue-100 mt-2">
                    <span className="text-slate-400 block text-[11px] uppercase font-bold">Message du bénéficiaire :</span>
                    <p className="italic text-slate-800 text-xs mt-1">« {selectedDossier.beneficiaire.commentaires} »</p>
                  </div>
                )}
              </div>

              {/* PIÈCES JUSTIFICATIVES TÉLÉCHARGEABLES */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center justify-between">
                  <span>Pièces Justificatives Déposées ({selectedDossier.documents.length})</span>
                </h3>

                <div className="space-y-2">
                  {selectedDossier.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 flex items-center justify-between gap-3 transition"
                    >
                      <div className="overflow-hidden flex-1">
                        <p className="font-bold text-xs text-slate-900">{doc.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {doc.originalName} ({(doc.size / (1024 * 1024)).toFixed(2)} Mo)
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/api/documents/${selectedDossier.id}/${doc.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 text-xs font-bold transition"
                          title="Visualiser le fichier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir</span>
                        </a>
                        <a
                          href={`/api/documents/${selectedDossier.id}/${doc.id}?download=1`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold transition"
                          title="Télécharger"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GESTION STATUT */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
                <h3 className="font-bold text-blue-900 uppercase tracking-wider text-xs">Mise à jour du dossier</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modifier le Statut</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DossierStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-xs bg-white"
                  >
                    <option value="en_attente">🟡 En attente de traitement</option>
                    <option value="en_cours">🔵 En cours d’instruction (Vérification en cours)</option>
                    <option value="pieces_manquantes">🟠 Pièces manquantes ou floues</option>
                    <option value="depose_dgfip">🟣 Dossier / Réclamation déposée auprès de la DGFiP</option>
                    <option value="restitution_validee">🟢 Restitution accordée & validée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message public affiché au bénéficiaire sur sa page de suivi
                  </label>
                  <textarea
                    rows={2}
                    value={newStatusMessage}
                    onChange={(e) => setNewStatusMessage(e.target.value)}
                    placeholder="Ex: Vos 3 fiches de paie sont validées. Nous préparons la réclamation pour la DGFiP."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Restitution Estimée (€)</label>
                    <input
                      type="number"
                      placeholder="Ex: 850"
                      value={restitutionEstimee}
                      onChange={(e) => setRestitutionEstimee(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">Montant Restitué Réel (€)</label>
                    <input
                      type="number"
                      placeholder="Ex: 920"
                      value={montantRestitue}
                      onChange={(e) => setMontantRestitue(e.target.value)}
                      className="w-full p-2 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs font-bold font-mono text-emerald-900"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ajouter une note interne (privée)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Appel passé à 14h, bénéficiaire d'accord pour la démarche."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-24 p-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateDossier}
                  disabled={isUpdating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                >
                  {isUpdating ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
                </button>
              </div>

              {/* NOTES INTERNES */}
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
                  Historique & Notes Internes
                </h3>
                <div className="space-y-2">
                  {selectedDossier.notesGestionnaire.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                        <span className="font-bold text-slate-700">{note.auteur}</span>
                        <span>{new Date(note.date).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-slate-800">{note.contenu}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
