import React from 'react';
import { convertNumberToIndianWords, formatIndianCurrency } from '../../utils/numberToWords';

export default function StandardInvoiceTemplate({ data }) {
  const {
    companyName = 'Apex Tech Studio',
    companyAddress = '45 Innovation Way, Suite 300, San Francisco, CA',
    companyEmail = 'contact@apextech.io',
    companyPhone = '+1 (555) 019-2834',
    companyLogo = '',
    invoiceNo = 'INV-8849',
    invoiceDate = '2026-07-25',
    dueDate = '2026-08-10',
    clientName = 'Aura Digital Agency',
    clientAddress = '789 Market Street, Floor 12, San Francisco, CA',
    items = [],
    taxRate = 10,
    discount = 0,
    bankDetails = 'Bank of America | SWIFT: BOFAUS3N | Account: 987654321',
    terms = 'Payment due within 30 days of invoice date.',
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
      className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-lg shadow-xl font-sans border border-slate-200"
    >
      {/* Top Banner */}
      <div className="flex justify-between items-start pb-8 border-b border-slate-200">
        <div className="space-y-2">
          {companyLogo ? (
            <img src={companyLogo} alt="Company Logo" className="h-12 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-lg">
                {companyName.charAt(0)}
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">{companyName}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{companyAddress}</p>
          <p className="text-xs text-slate-500">{companyEmail} | {companyPhone}</p>
        </div>

        <div className="text-right space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">INVOICE</h1>
          <p className="text-sm font-bold text-slate-600">#{invoiceNo}</p>
          <div className="text-xs text-slate-500 pt-2 space-y-0.5">
            <p>Issued: <strong className="text-slate-700">{invoiceDate}</strong></p>
            <p>Due: <strong className="text-slate-700">{dueDate}</strong></p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Billed To</span>
          <h2 className="text-base font-bold text-slate-900 mt-1">{clientName}</h2>
          <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{clientAddress}</p>
        </div>
        <div className="sm:text-right">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Payment Status</span>
          <div className="mt-1">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              Pending Payment
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="py-6">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-slate-900 text-slate-900 font-extrabold uppercase text-[11px] tracking-wider">
              <th className="py-3">Description</th>
              <th className="py-3 text-center">Qty</th>
              <th className="py-3 text-right">Price</th>
              <th className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const total = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
              return (
                <tr key={idx}>
                  <td className="py-3.5 font-medium text-slate-900">{item.description}</td>
                  <td className="py-3.5 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-3.5 text-right text-slate-600">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                  <td className="py-3.5 text-right font-bold text-slate-900">₹{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
        <div className="w-full sm:w-1/2 space-y-3">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount in Words</span>
            <p className="text-xs font-bold text-slate-800">{amountInWords}</p>
          </div>
          {bankDetails && (
            <p className="text-xs text-slate-500">
              <strong>Bank Info:</strong> {bankDetails}
            </p>
          )}
        </div>

        <div className="w-full sm:w-5/12 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount ({discount}%)</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Tax ({taxRate}%)</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t-2 border-slate-900">
            <span>Total Due</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Signature & Terms */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end">
        <div className="text-xs text-slate-500 max-w-xs">
          <p className="font-semibold text-slate-700">Terms & Conditions:</p>
          <p>{terms}</p>
        </div>
        {signatureImage && (
          <div className="text-right">
            <img src={signatureImage} alt="Signature" className="h-12 ml-auto object-contain mb-1" />
            <span className="text-[10px] text-slate-400 block border-t border-slate-300 pt-0.5">Authorized Signature</span>
          </div>
        )}
      </div>
    </div>
  );
}
