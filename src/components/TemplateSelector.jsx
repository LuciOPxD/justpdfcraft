import React, { useState } from 'react';
import {
  FileText,
  Receipt,
  Printer,
  Sparkles,
  FileSpreadsheet,
  Fuel,
  Home,
  Car,
  ShoppingBag,
  Utensils,
  Stethoscope,
  Search,
  Grid,
  Check
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Grid },
  { id: 'gst', name: 'GST Invoice', icon: FileText },
  { id: 'fuel', name: 'Fuel / Petrol', icon: Fuel },
  { id: 'rent', name: 'Rent & HRA', icon: Home },
  { id: 'cab', name: 'Cab & Travel', icon: Car },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingBag },
  { id: 'hotel', name: 'Hotel & Food', icon: Utensils },
  { id: 'medical', name: 'Medical', icon: Stethoscope },
  { id: 'thermal', name: 'POS Thermal', icon: Printer }
];

export const TEMPLATES = [
  {
    id: 'gst',
    category: 'gst',
    name: 'GST Tax Invoice',
    desc: 'Indian Tax Invoice with GSTIN, HSN/SAC, CGST/SGST/IGST breakdown',
    icon: FileText,
    badge: 'Popular'
  },
  {
    id: 'fuel',
    category: 'fuel',
    name: 'Fuel / Petrol Bill',
    desc: 'Indian Oil / HP / BPCL Petrol Pump receipt with Nozzle & Litres',
    icon: Fuel,
    badge: 'Fuel'
  },
  {
    id: 'rent',
    category: 'rent',
    name: 'Rent Receipt (HRA)',
    desc: 'House Rent Receipt for HRA tax claim with Landlord PAN details',
    icon: Home,
    badge: 'Tax HRA'
  },
  {
    id: 'cab',
    category: 'cab',
    name: 'Cab Ride Receipt',
    desc: 'Uber & Ola travel receipt with pickup/drop and fare breakdown',
    icon: Car,
    badge: 'Travel'
  },
  {
    id: 'ecommerce',
    category: 'ecommerce',
    name: 'E-Commerce Invoice',
    desc: 'Amazon & Flipkart retail shipping tax invoice layout',
    icon: ShoppingBag
  },
  {
    id: 'hotel',
    category: 'hotel',
    name: 'Hotel & Food Bill',
    desc: 'Restaurant food bill with Table #, Steward, and Service charge',
    icon: Utensils
  },
  {
    id: 'medical',
    category: 'medical',
    name: 'Medical & Pharmacy',
    desc: 'Pharmacy invoice with Drug License # and medicine batch details',
    icon: Stethoscope
  },
  {
    id: 'standard',
    category: 'gst',
    name: 'Standard Corporate',
    desc: 'Clean corporate A4 business invoice format',
    icon: FileSpreadsheet
  },
  {
    id: 'thermal',
    category: 'thermal',
    name: 'POS Thermal Roll',
    desc: '80mm POS thermal paper roll receipt with tear edges',
    icon: Printer,
    badge: '80mm POS'
  },
  {
    id: 'minimalist',
    category: 'gst',
    name: 'Minimalist Receipt',
    desc: 'Sleek dark/light minimal typography design',
    icon: Receipt
  },
  {
    id: 'quotation',
    category: 'gst',
    name: 'Business Quotation',
    desc: 'Price estimate & quotation with validity terms',
    icon: Sparkles
  }
];

export default function TemplateSelector({ selectedTemplate, onSelectTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Category Navigation Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-[#0b1120] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030712] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Grid of Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredTemplates.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`relative flex flex-col p-4 rounded-2xl text-left border transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border-indigo-500 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-500/40 scale-[1.01]'
                  : 'bg-[#0f172a]/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {tmpl.badge && (
                <span className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {tmpl.badge}
                </span>
              )}

              <div className={`p-2.5 rounded-xl w-fit mb-3 transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-white text-sm">{tmpl.name}</h4>
                {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
              </div>

              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tmpl.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
