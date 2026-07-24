import React from 'react';
import { convertNumberToIndianWords, formatIndianCurrency } from '../../utils/numberToWords';

export default function GSTInvoiceTemplate({ data }) {
  const {
    companyName = 'ACME Solutions Private Limited',
    companyGstin = '07AAAAA0000A1Z5',
    companyAddress = '123 Tech Park, Cyber City, New Delhi - 110001',
    companyPhone = '+91 98765 43210',
    companyEmail = 'billing@acmesolutions.in',
    companyLogo = '',
    invoiceNo = 'INV-2026-001',
    invoiceDate = '2026-07-25',
    dueDate = '2026-08-10',
    placeOfSupply = '07-Delhi',
    gstType = 'CGST_SGST', // 'CGST_SGST' or 'IGST'
    clientName = 'Global Trading Corp',
    clientGstin = '07BBBBB1111B1Z2',
    clientAddress = '456 Commercial Hub, Connaught Place, New Delhi',
    items = [],
    taxRate = 18,
    discount = 0,
    bankDetails = 'HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123',
    terms = 'Payment due within 15 days. Subject to Delhi Jurisdiction.',
    signatureImage = '',
    notes = 'Thank you for your business!'
  } = data || {};

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const discountAmount = (subtotal * parseFloat(discount || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (gstType === 'CGST_SGST') {
    cgstAmount = (taxableAmount * (taxRate / 2)) / 100;
    sgstAmount = (taxableAmount * (taxRate / 2)) / 100;
  } else {
    igstAmount = (taxableAmount * taxRate) / 100;
  }

  const grandTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;
  const amountInWords = convertNumberToIndianWords(grandTotal);

  return (
    <div
      id="printable-document"
      className="w-full max-w-[800px] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-lg shadow-xl font-sans text-xs sm:text-sm border border-slate-200"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-indigo-600 pb-6 mb-6 gap-4">
        <div className="space-y-1">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="h-12 object-contain mb-2" />
          ) : (
            <h1 className="text-xl sm:text-2xl font-extrabold text-indigo-700 uppercase tracking-wide">
              {companyName}
            </h1>
          )}
          <p className="text-slate-600 max-w-xs leading-relaxed">{companyAddress}</p>
          <div className="text-slate-500 font-medium pt-1">
            <span>GSTIN: <strong className="text-slate-800">{companyGstin}</strong></span> | <span>Ph: {companyPhone}</span>
          </div>
        </div>

        <div className="text-right sm:text-right w-full sm:w-auto">
          <span className="inline-block bg-indigo-100 text-indigo-800 font-extrabold px-3 py-1 rounded text-xs tracking-wider uppercase mb-2">
            Tax Invoice (GST)
          </span>
          <div className="space-y-1 text-slate-700">
            <p>Invoice No: <strong className="text-slate-900">{invoiceNo}</strong></p>
            <p>Date: <span>{invoiceDate}</span></p>
            <p>Due Date: <span>{dueDate}</span></p>
            <p>Place of Supply: <strong>{placeOfSupply}</strong></p>
          </div>
        </div>
      </div>

      {/* Bill To & Billed From details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Billed To (Customer):</h3>
          <p className="font-bold text-slate-900 text-base">{clientName}</p>
          <p className="text-slate-600 mt-1 whitespace-pre-line">{clientAddress}</p>
          <p className="text-slate-700 font-medium mt-2">
            GSTIN / UIN: <span className="font-bold text-slate-900">{clientGstin || 'URP (Unregistered)'}</span>
          </p>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Supplier Details:</h3>
          <p className="font-semibold text-slate-800">{companyName}</p>
          <p className="text-slate-600">{companyEmail}</p>
          <p className="text-slate-600">State Code: Delhi (07)</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-900 text-white font-bold text-xs uppercase">
              <th className="p-2.5 rounded-l">#</th>
              <th className="p-2.5">Item Description</th>
              <th className="p-2.5 text-center">HSN/SAC</th>
              <th className="p-2.5 text-right">Qty</th>
              <th className="p-2.5 text-right">Rate</th>
              <th className="p-2.5 text-right rounded-r">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {items.length > 0 ? (
              items.map((item, idx) => {
                const itemAmount = (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0));
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2.5 font-medium text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                    <td className="p-2.5 text-center font-mono text-xs">{item.hsn || '9983'}</td>
                    <td className="p-2.5 text-right">{item.quantity}</td>
                    <td className="p-2.5 text-right">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">₹{itemAmount.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-400 italic">No items added yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary & Tax Calculation */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
        {/* Rupees in Words (Indian Currency Engine) */}
        <div className="w-full sm:w-7/12 space-y-3">
          <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-900 uppercase block tracking-wider mb-1">
              Total Amount in Words (INR):
            </span>
            <p className="font-bold text-indigo-950 capitalize leading-snug">{amountInWords}</p>
          </div>

          {bankDetails && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong className="text-slate-800 block mb-1">Bank Payment Details:</strong>
              <p className="font-mono">{bankDetails}</p>
            </div>
          )}
        </div>

        {/* Amount Calculations */}
        <div className="w-full sm:w-5/12 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount ({discount}%):</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
            <span>Taxable Value:</span>
            <span className="font-semibold text-slate-900">₹{taxableAmount.toFixed(2)}</span>
          </div>

          {gstType === 'CGST_SGST' ? (
            <>
              <div className="flex justify-between text-slate-600">
                <span>CGST ({taxRate / 2}%):</span>
                <span>₹{cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({taxRate / 2}%):</span>
                <span>₹{sgstAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600">
              <span>IGST ({taxRate}%):</span>
              <span>₹{igstAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm sm:text-base font-extrabold text-indigo-950 pt-2 border-t-2 border-indigo-600">
            <span>Grand Total:</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer Terms & Signature */}
      <div className="flex flex-col sm:flex-row justify-between items-end pt-6 border-t border-slate-200 gap-6">
        <div className="space-y-2 max-w-sm">
          <p className="text-[11px] text-slate-500">
            <strong>Terms & Conditions:</strong> {terms}
          </p>
          <p className="text-[11px] text-slate-500 italic">{notes}</p>
        </div>

        <div className="text-center w-full sm:w-auto">
          {signatureImage ? (
            <img src={signatureImage} alt="Signature" className="h-14 mx-auto object-contain mb-1" />
          ) : (
            <div className="h-12 w-36 mx-auto border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] text-slate-400 pb-1">
              Authorized Signature
            </div>
          )}
          <p className="font-bold text-slate-800 text-xs">{companyName}</p>
          <p className="text-[10px] text-slate-500">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
