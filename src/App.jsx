import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import TemplateSelector from './components/TemplateSelector';
import SplitScreenEditor from './components/SplitScreenEditor';
import { getSavedDrafts, saveDraft, deleteDraft } from './utils/storage';
import { exportElementToPDF } from './utils/pdfExport';
import { Sparkles, CheckCircle2, AlertCircle, ShieldCheck, Download, Zap } from 'lucide-react';

const PDFToolsSuite = lazy(() => import('./components/PDFToolsSuite'));

const DEFAULT_FORM_DATA = {
  id: 'draft_default',
  companyName: 'JustPDFCraft Tech Private Limited',
  companyGstin: '07AAACJ1234F1Z9',
  companyAddress: 'Plot 104, Cyber City Phase II, Gurgaon, Haryana - 122002',
  companyPhone: '+91 98123 45678',
  companyEmail: 'billing@justpdfcraft.xyz',
  companyLogo: '',
  invoiceNo: 'INV-2026-108',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  placeOfSupply: '07-Delhi',
  gstType: 'CGST_SGST',
  clientName: 'Nexus Global Solutions',
  clientGstin: '07BBBBB9999B1Z4',
  clientAddress: 'Level 5, Tower B, Connaught Place, New Delhi - 110001',
  items: [
    { description: 'React 19 & Split-Screen Web App Development', hsn: '998313', quantity: 1, rate: 45000 },
    { description: 'High-DPI PDF & Thermal POS Receipt Export Engine', hsn: '998314', quantity: 1, rate: 15000 }
  ],
  taxRate: 18,
  discount: 5,
  bankDetails: 'HDFC Bank | A/C: 502000889977 | IFSC: HDFC0000104',
  terms: 'Payment due within 15 days of invoice date. All processing completed client-side.',
  signatureImage: '',
  notes: 'Thank you for choosing BillGenerator Studio!'
};

export default function App() {
  const [activeMode, setActiveMode] = useState('editor'); // 'editor' or 'tools'
  const [selectedTemplate, setSelectedTemplate] = useState('gst');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setSavedDrafts(getSavedDrafts());
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSaveDraft = () => {
    const saved = saveDraft(formData);
    if (saved) {
      setSavedDrafts(getSavedDrafts());
      showToast('Draft saved securely in LocalStorage! 💾', 'success');
    } else {
      showToast('Failed to save draft', 'error');
    }
  };

  const handleDeleteDraft = (id) => {
    const updated = deleteDraft(id);
    setSavedDrafts(updated);
    showToast('Draft deleted', 'success');
  };

  const handleLoadDraft = (draft) => {
    setFormData(draft);
  };

  const handleHeaderDownloadPDF = async () => {
    const el = document.getElementById('printable-document');
    if (!el) return;
    try {
      const filename = `${formData.invoiceNo || 'document'}.pdf`;
      const format = (selectedTemplate === 'thermal' || selectedTemplate === 'fuel' || selectedTemplate === 'hotel') ? 'thermal' : 'a4';
      await exportElementToPDF(el, filename, format);
      showToast('PDF Exported Successfully! 🎉', 'success');
    } catch (err) {
      showToast('Failed to export PDF', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-dark text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        savedDrafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onToast={showToast}
        onDownloadPDF={handleHeaderDownloadPDF}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeMode === 'editor' ? (
          <>
            {/* Top Banner with UI/UX layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0f172a] via-indigo-950/40 to-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    BillGenerator & Document Studio
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Zap className="w-3 h-3 text-indigo-400" /> Fast Export
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select a template below to build GST Invoices, Petrol Bills, Rent Receipts, Cab Receipts & POS Bills.
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleHeaderDownloadPDF}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Download PDF
                </button>
              </div>
            </div>

            {/* Template Selector Pills & Grid */}
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />

            {/* Split Screen Synchronized Workspace */}
            <SplitScreenEditor
              formData={formData}
              setFormData={setFormData}
              selectedTemplate={selectedTemplate}
              onSaveDraft={handleSaveDraft}
              onToast={showToast}
            />
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl font-black text-white">Client-Side PDF Utility Suite</h2>
              <p className="text-xs text-slate-400">
                Merge PDF files or convert images to PDF. 100% private, browser local.
              </p>
            </div>
            <Suspense fallback={
              <div className="text-center py-12 text-slate-400 text-sm animate-pulse">Loading PDF Tools...</div>
            }>
              <PDFToolsSuite onToast={showToast} />
            </Suspense>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>BillGenerator Studio &copy; {new Date().getFullYear()} — Built with React 19 & Tailwind CSS v4</p>
        <p className="text-[10px] text-slate-600">
          All document processing and draft saving occurs 100% locally in your browser.
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
