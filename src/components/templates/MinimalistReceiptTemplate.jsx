import React from 'react';
import { formatIndianCurrency } from '../../utils/numberToWords';

export default function MinimalistReceiptTemplate({ data }) {
  const {
    companyName = 'Lumina Design Studio',
    companyEmail = 'hello@luminastudio.com',
    invoiceNo = 'RCPT-3042',
    invoiceDate = '2026-07-25',
    clientName = 'Minimal Co',
    items = [],
    taxRate = 18,
    discount = 0,
    signatureImage = ''
  } = data || {};

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const discountAmount = (subtotal * parseFloat(discount || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * parseFloat(taxRate || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div
      id="printable-document"
      className="w-full max-w-[700px] mx-auto bg-slate-950 text-slate-100 p-8 sm:p-12 rounded-2xl shadow-2xl font-sans border border-slate-800"
    >
      <div className="flex justify-between items-center pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{companyName}</h1>
          <p className="text-xs text-slate-400">{companyEmail}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-indigo-400 block">#{invoiceNo}</span>
          <span className="text-xs text-slate-400">{invoiceDate}</span>
        </div>
      </div>

      <div className="py-6">
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mb-1">Receipt For</span>
        <h2 className="text-lg font-semibold text-white">{clientName}</h2>
      </div>

      <div className="space-y-3 py-4">
        {items.map((item, idx) => {
          const total = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
          return (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-900 text-sm">
              <div>
                <p className="font-medium text-slate-200">{item.description}</p>
                <span className="text-xs text-slate-500">{item.quantity} × ₹{item.rate}</span>
              </div>
              <span className="font-mono font-semibold text-white">₹{total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-slate-800 space-y-2 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Discount ({discount}%)</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>GST Tax ({taxRate}%)</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-white pt-4 border-t border-slate-800">
          <span>Total Paid</span>
          <span className="text-indigo-400 font-mono">{formatIndianCurrency(grandTotal)}</span>
        </div>
      </div>

      {signatureImage && (
        <div className="mt-8 pt-4 border-t border-slate-900 flex justify-end">
          <div className="text-center">
            <img src={signatureImage} alt="Signature" className="h-10 invert opacity-80" />
            <span className="text-[10px] text-slate-500 block">Digital Verification</span>
          </div>
        </div>
      )}
    </div>
  );
}
