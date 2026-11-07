import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-black text-slate-900 mb-2">Page introuvable</h2>
      <p className="text-slate-500 text-sm mb-6">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}

