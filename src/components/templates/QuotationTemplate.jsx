import React from 'react';
import { convertNumberToIndianWords, formatIndianCurrency } from '../../utils/numberToWords';

export default function QuotationTemplate({ data }) {
  const {
    companyName = 'Vortex Digital Solutions',
    companyAddress = 'Plot 42, Knowledge Park III, Greater Noida',
    companyPhone = '+91 99887 76655',
    companyEmail = 'quotes@vortexdigital.in',
    invoiceNo = 'QT-2026-091',
    invoiceDate = '2026-07-25',
    dueDate = '2026-08-25',
    clientName = 'Zenith Retail Outlets',
    clientAddress = '108 Sector 18, Noida, Uttar Pradesh',
    items = [],
    taxRate = 18,
    discount = 0,
    terms = 'This price estimate is valid for 30 days. 50% advance payment required upon approval.',
    signatureImage = ''
  } = data || {};

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const discountAmount = (subtotal * parseFloat(discount || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * parseFloat(taxRate || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;
  const amountInWords = convertNumberToIndianWords(grandTotal);

  return (
    <div
      id="printable-document"
      className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-lg shadow-xl font-sans border-t-8 border-indigo-600"
    >
      <div className="flex justify-between items-start pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-indigo-900">{companyName}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{companyAddress}</p>
          <p className="text-xs text-slate-500">{companyEmail} | {companyPhone}</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-indigo-100 text-indigo-800 font-extrabold px-3 py-1 rounded text-xs tracking-wider uppercase mb-2">
            PRICE QUOTATION / ESTIMATE
          </span>
          <p className="text-sm font-bold text-slate-900">Quote #: {invoiceNo}</p>
          <p className="text-xs text-slate-500">Date: {invoiceDate}</p>
          <p className="text-xs text-slate-500">Valid Until: {dueDate}</p>
        </div>
      </div>

      <div className="py-6 border-b border-slate-100">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Prepared For:</span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">{clientName}</h2>
        <p className="text-xs text-slate-600 whitespace-pre-line">{clientAddress}</p>
      </div>

      <div className="py-6">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
              <th className="p-2.5 rounded-l">Item & Specification</th>
              <th className="p-2.5 text-center">Qty</th>
              <th className="p-2.5 text-right">Unit Rate</th>
              <th className="p-2.5 text-right rounded-r">Estimated Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const total = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
              return (
                <tr key={idx}>
                  <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                  <td className="p-2.5 text-center">{item.quantity}</td>
                  <td className="p-2.5 text-right">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">₹{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
        <div className="w-full sm:w-1/2 space-y-3">
          <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
            <span className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">Total Estimated Amount in Words</span>
            <p className="text-xs font-bold text-indigo-950 capitalize">{amountInWords}</p>
          </div>
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong className="block mb-1">Quotation Terms:</strong>
            <p>{terms}</p>
          </div>
        </div>

        <div className="w-full sm:w-5/12 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Estimated Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Special Discount ({discount}%):</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Estimated Tax ({taxRate}%):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-indigo-950 pt-3 border-t-2 border-indigo-600">
            <span>Grand Total Estimate:</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {signatureImage && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
          <div className="text-center">
            <img src={signatureImage} alt="Signature" className="h-12 mx-auto object-contain mb-1" />
            <p className="font-bold text-xs text-slate-800">{companyName}</p>
            <p className="text-[10px] text-slate-500">Authorized Representative</p>
          </div>
        </div>
      )}
    </div>
  );
}
