import React from 'react';
import { Layers, Sparkles, ShieldCheck, Heart, Search } from 'lucide-react';

export default function Navbar({ onSelectCategory, onSearchClick }) {
  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCategory('all')}>
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
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                iLovePDF Stack
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              100% Free Client-Side In-Browser PDF Suite
            </p>
          </div>
        </div>

        {/* Quick Tool Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-300">
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'organize', label: 'Merge & Split' },
            { id: 'optimize', label: 'Compress PDF' },
            { id: 'convert_to', label: 'Convert to PDF' },
            { id: 'convert_from', label: 'Convert from PDF' },
            { id: 'edit', label: 'Edit & Sign' },
            { id: 'security', label: 'PDF Security' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Badge & Security Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">100% Private (No Uploads)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
