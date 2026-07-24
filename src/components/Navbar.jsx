import React, { useState } from 'react';
import { FileText, Layers, FolderDown, Sparkles, Trash2, Clock, Download, ShieldCheck } from 'lucide-react';

export default function Navbar({
  activeMode,
  setActiveMode,
  savedDrafts,
  onLoadDraft,
  onDeleteDraft,
  onToast,
  onDownloadPDF
}) {
  const [showDraftsModal, setShowDraftsModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveMode('editor')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 p-0.5 shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-[#080c14] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base text-white tracking-tight">
                JustPDF<span className="text-indigo-400">Craft</span>
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                iLovePDF Stack
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              100% Free In-Browser PDF Suite & Document Generator
            </p>
          </div>
        </div>

        {/* Floating Center Mode Tabs */}
        <div className="flex items-center bg-[#0b1120] border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setActiveMode('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeMode === 'editor'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bill & Invoice Studio</span>
          </button>
          <button
            onClick={() => setActiveMode('tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeMode === 'tools'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>iLovePDF Suite</span>
          </button>
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDraftsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all relative"
          >
            <FolderDown className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Drafts</span>
            {savedDrafts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {savedDrafts.length}
              </span>
            )}
          </button>

          {activeMode === 'editor' && (
            <button
              onClick={onDownloadPDF}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Saved Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <FolderDown className="w-5 h-5" />
                <span>Saved Drafts (LocalStorage)</span>
              </div>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {savedDrafts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No saved drafts in browser memory.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3 bg-[#080c14] border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white truncate max-w-[180px]">
                        {draft.invoiceNo || 'Untitled Draft'}
                      </h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{new Date(draft.updatedAt).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadDraft(draft);
                          setShowDraftsModal(false);
                          if (onToast) onToast('Draft loaded successfully!', 'success');
                        }}
                        className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1.5 rounded-xl text-red-400 hover:bg-red-950/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
