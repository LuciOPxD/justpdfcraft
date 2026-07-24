import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PDFToolsSuite = lazy(() => import('./components/PDFToolsSuite'));

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-dark text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navbar */}
      <Navbar onSelectCategory={(cat) => setActiveCategory(cat)} />

      {/* Main iLovePDF Suite Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-400">Loading iLovePDF Client Engine...</p>
          </div>
        }>
          <PDFToolsSuite
            onToast={showToast}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1 bg-[#080c14]">
        <p>JustPDFCraft &copy; {new Date().getFullYear()} — Every tool you need to work with PDFs in one place.</p>
        <p className="text-[10px] text-slate-600">
          All PDF operations take place 100% locally inside your browser memory for total privacy and zero data leakage.
        </p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-[#0f172a] text-emerald-400 border-emerald-800/80'
              : 'bg-[#0f172a] text-red-400 border-red-800/80'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
