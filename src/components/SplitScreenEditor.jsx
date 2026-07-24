import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Printer as PrintIcon,
  Save,
  PenTool,
  Building2,
  UserCheck,
  Package,
  CreditCard,
  Eye,
  FileEdit,
  Sparkles,
  Fuel,
  Home,
  Car,
  RotateCcw
} from 'lucide-react';
import SignaturePad from './SignaturePad';
import GSTInvoiceTemplate from './templates/GSTInvoiceTemplate';
import StandardInvoiceTemplate from './templates/StandardInvoiceTemplate';
import ThermalReceiptTemplate from './templates/ThermalReceiptTemplate';
import MinimalistReceiptTemplate from './templates/MinimalistReceiptTemplate';
import QuotationTemplate from './templates/QuotationTemplate';
import FuelBillTemplate from './templates/FuelBillTemplate';
import RentReceiptTemplate from './templates/RentReceiptTemplate';
import CabReceiptTemplate from './templates/CabReceiptTemplate';
import ECommerceTemplate from './templates/ECommerceTemplate';
import HotelBillTemplate from './templates/HotelBillTemplate';
import MedicalBillTemplate from './templates/MedicalBillTemplate';
import { exportElementToPDF } from '../utils/pdfExport';
import { convertNumberToIndianWords } from '../utils/numberToWords';

export default function SplitScreenEditor({
  formData,
  setFormData,
  selectedTemplate,
  onSaveDraft,
  onToast
}) {
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' or 'preview'
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: 'New Product / Item', hsn: '9983', quantity: 1, rate: 500 }]
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateSubtotal = () => {
    return (formData.items || []).reduce(
      (acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)),
      0
    );
  };

  const calculateGrandTotal = () => {
    if (selectedTemplate === 'fuel') {
      return parseFloat(formData.rate || 0) * parseFloat(formData.volume || 0);
    }
    if (selectedTemplate === 'rent') {
      return parseFloat(formData.rentAmount || 0);
    }
    if (selectedTemplate === 'cab') {
      return parseFloat(formData.baseFare || 0) + parseFloat(formData.tollCharge || 0) + parseFloat(formData.gstTax || 0);
    }
    const subtotal = calculateSubtotal();
    const discountAmt = (subtotal * parseFloat(formData.discount || 0)) / 100;
    const taxable = Math.max(0, subtotal - discountAmt);
    const taxAmt = (taxable * parseFloat(formData.taxRate || 0)) / 100;
    return taxable + taxAmt;
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const el = document.getElementById('printable-document');
      const filename = `${formData.invoiceNo || 'document'}.pdf`;
      const format = (selectedTemplate === 'thermal' || selectedTemplate === 'fuel' || selectedTemplate === 'hotel') ? 'thermal' : 'a4';
      await exportElementToPDF(el, filename, format);
      if (onToast) onToast('PDF Downloaded Successfully! 🎉', 'success');
    } catch (err) {
      if (onToast) onToast('Failed to export PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'gst':
        return <GSTInvoiceTemplate data={formData} />;
      case 'fuel':
        return <FuelBillTemplate data={formData} />;
      case 'rent':
        return <RentReceiptTemplate data={formData} />;
      case 'cab':
        return <CabReceiptTemplate data={formData} />;
      case 'ecommerce':
        return <ECommerceTemplate data={formData} />;
      case 'hotel':
        return <HotelBillTemplate data={formData} />;
      case 'medical':
        return <MedicalBillTemplate data={formData} />;
      case 'standard':
        return <StandardInvoiceTemplate data={formData} />;
      case 'thermal':
        return <ThermalReceiptTemplate data={formData} />;
      case 'minimalist':
        return <MinimalistReceiptTemplate data={formData} />;
      case 'quotation':
        return <QuotationTemplate data={formData} />;
      default:
        return <GSTInvoiceTemplate data={formData} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-[#0b1120] border border-slate-800 rounded-xl p-1 shadow-inner">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>Form Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Canvas</span>
        </button>
      </div>

      {/* Main Split Screen Editor & Canvas Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: FORM EDITOR */}
        <div
          className={`md:col-span-6 space-y-4 ${
            mobileTab === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Vendor Details Section */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2.5">
              <Building2 className="w-4 h-4" />
              <span>Business & Vendor Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formData.companyGstin}
                  onChange={(e) => handleInputChange('companyGstin', e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Address</label>
                <textarea
                  rows="2"
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Special Template Fields */}
          {selectedTemplate === 'fuel' && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2.5">
                <Fuel className="w-4 h-4" />
                <span>Petrol Pump Specific Fields</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Fuel Type</label>
                  <input
                    type="text"
                    value={formData.fuelType || 'Petrol (Speed)'}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Vehicle No</label>
                  <input
                    type="text"
                    value={formData.vehicleNo || 'DL 01 AB 1234'}
                    onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Rate / Litre (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate || 96.72}
                    onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Volume (Litres)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.volume || 36.19}
                    onChange={(e) => handleInputChange('volume', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTemplate === 'rent' && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2.5">
                <Home className="w-4 h-4" />
                <span>Rent & HRA Tax Exemption Fields</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Rent Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.rentAmount || 18500}
                    onChange={(e) => handleInputChange('rentAmount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Rent Month</label>
                  <input
                    type="text"
                    value={formData.rentPeriod || 'July 2026'}
                    onChange={(e) => handleInputChange('rentPeriod', e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Landlord Name</label>
                  <input
                    type="text"
                    value={formData.landlordName || 'Suresh Kumar Verma'}
                    onChange={(e) => handleInputChange('landlordName', e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Landlord PAN</label>
                  <input
                    type="text"
                    value={formData.landlordPan || 'ABCDE1234F'}
                    onChange={(e) => handleInputChange('landlordPan', e.target.value)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Details Section */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2.5">
              <UserCheck className="w-4 h-4" />
              <span>Customer / Billed To</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Invoice / Receipt #</label>
                <input
                  type="text"
                  value={formData.invoiceNo}
                  onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date</label>
                <input
                  type="text"
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          {selectedTemplate !== 'fuel' && selectedTemplate !== 'rent' && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl border-l-4 border-l-violet-500">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
                  <Package className="w-4 h-4" />
                  <span>Itemized Table Rows</span>
                </div>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#030712] p-3 rounded-xl border border-slate-800 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() => removeItem(idx)}
                        disabled={formData.items.length <= 1}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block mb-0.5">HSN/SAC</span>
                        <input
                          type="text"
                          value={item.hsn || ''}
                          onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                          className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Rate (₹)</span>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax & Discounts */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">GST Tax (%)</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#030712] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Indian Currency Words Live Preview */}
              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3 text-xs space-y-1">
                <span className="text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider block">
                  Indian Currency Words Converter:
                </span>
                <p className="text-indigo-200 font-bold capitalize">
                  {convertNumberToIndianWords(calculateGrandTotal())}
                </p>
              </div>
            </div>
          )}

          {/* Signature Pad Trigger Section */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl border-l-4 border-l-pink-500">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2.5">
              <CreditCard className="w-4 h-4" />
              <span>Digital Signature & Stamp</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSignaturePad(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold transition-all shadow"
              >
                <PenTool className="w-4 h-4" />
                <span>{formData.signatureImage ? 'Redraw Signature' : 'Open Signature Canvas'}</span>
              </button>
              {formData.signatureImage && (
                <button
                  onClick={() => handleInputChange('signatureImage', '')}
                  className="text-xs text-red-400 hover:text-red-300 underline font-medium"
                >
                  Remove Signature
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE CANVAS PREVIEW & FLOATING ACTIONS */}
        <div
          className={`md:col-span-6 space-y-4 sticky top-20 ${
            mobileTab === 'editor' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Header Action Bar over Canvas */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Canvas Preview</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onSaveDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
              >
                <Save className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
              >
                <PrintIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>

          {/* Document Render Canvas Frame */}
          <div
            ref={previewRef}
            className="overflow-x-auto p-4 bg-[#030712] border border-slate-800 rounded-2xl min-h-[600px] flex justify-center items-start shadow-inner"
          >
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <SignaturePad
          initialImage={formData.signatureImage}
          onSave={(sigDataUrl) => handleInputChange('signatureImage', sigDataUrl)}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
}
