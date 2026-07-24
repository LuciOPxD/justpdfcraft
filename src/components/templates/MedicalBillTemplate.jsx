import React from 'react';
import { convertNumberToIndianWords, formatIndianCurrency } from '../../utils/numberToWords';

export default function MedicalBillTemplate({ data }) {
  const {
    companyName = 'APOLLO PHARMACY & MEDICO',
    companyAddress = 'Shop 12, Main Market, Lajpat Nagar, New Delhi',
    companyGstin = '07AAAAM9999A1Z1',
    dlNumber = 'DL-20B/2026/8849',
    invoiceNo = 'MED-2026-4410',
    invoiceDate = '2026-07-25',
    doctorName = 'Dr. A. K. Sharma (MD)',
    patientName = 'Karan Singh',
    items = [],
    taxRate = 12,
    discount = 0,
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
      className="w-full max-w-[750px] mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-xl font-sans text-xs border-2 border-emerald-500"
    >
      <div className="flex justify-between items-start pb-4 border-b-2 border-emerald-600">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-emerald-700">✚</span>
            <h1 className="text-xl font-black text-slate-950">{companyName}</h1>
          </div>
          <p className="text-slate-600 mt-0.5">{companyAddress}</p>
          <p className="text-slate-500 font-mono text-[11px]">DL #: {dlNumber} | GSTIN: {companyGstin}</p>
        </div>
        <div className="text-right">
          <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded text-xs">
            MEDICAL TAX INVOICE
          </span>
          <p className="mt-2">Bill No: <strong>{invoiceNo}</strong></p>
          <p>Date: <strong>{invoiceDate}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 bg-slate-50 p-3 rounded-lg my-4">
        <div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Patient Name:</span>
          <p className="font-bold text-slate-900 text-sm">{patientName}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Prescribed By:</span>
          <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
        </div>
      </div>

      <div className="py-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-900 text-white font-bold text-[11px] uppercase">
              <th className="p-2">Medicine / Item</th>
              <th className="p-2 text-center">Batch #</th>
              <th className="p-2 text-center">Exp Date</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">MRP (₹)</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
              return (
                <tr key={idx}>
                  <td className="p-2 font-semibold text-slate-900">{item.description}</td>
                  <td className="p-2 text-center font-mono text-[11px]">{item.hsn || 'B-991'}</td>
                  <td className="p-2 text-center font-mono text-[11px]">12/2027</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                  <td className="p-2 text-right font-bold text-slate-900">₹{itemTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-start pt-4 border-t-2 border-slate-900 gap-4">
        <div className="space-y-2 max-w-xs">
          <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 text-[11px]">
            <span className="font-bold text-emerald-950 block">Amount in Words:</span>
            <p className="font-semibold text-slate-800 capitalize">{amountInWords}</p>
          </div>
          <p className="text-[10px] text-slate-500">Medicines once sold cannot be taken back without original bill.</p>
        </div>

        <div className="text-right space-y-1">
          <div className="flex justify-between gap-6 text-slate-600">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-6 text-slate-600">
            <span>GST ({taxRate}%):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-6 text-base font-black text-emerald-950 pt-2 border-t border-slate-900">
            <span>Payable Amount:</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
