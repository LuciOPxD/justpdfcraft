import React from 'react';
import { convertNumberToIndianWords, formatIndianCurrency } from '../../utils/numberToWords';

export default function RentReceiptTemplate({ data }) {
  const {
    companyName = 'HOUSE RENT RECEIPT (HRA CLAIM)',
    invoiceNo = 'RENT-2026-07',
    invoiceDate = '2026-07-25',
    clientName = 'Rahul Sharma', // Tenant
    landlordName = 'Suresh Kumar Verma',
    landlordPan = 'ABCDE1234F',
    rentAmount = 18500,
    rentPeriod = 'July 2026',
    propertyAddress = 'Flat No. 402, Sunshine Apartments, Sector 62, Noida, U.P.',
    paymentMode = 'Bank Transfer / UPI',
    signatureImage = ''
  } = data || {};

  const amountInWords = convertNumberToIndianWords(rentAmount);

  return (
    <div
      id="printable-document"
      className="w-full max-w-[750px] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl font-sans border-2 border-indigo-200"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b-2 border-indigo-600">
        <div>
          <span className="bg-indigo-600 text-white font-extrabold text-xs px-3 py-1 rounded-full tracking-wider uppercase">
            RENT RECEIPT
          </span>
          <h1 className="text-xl font-black text-indigo-950 mt-2">HRA TAX EXEMPTION RECEIPT</h1>
        </div>
        <div className="text-right text-xs text-slate-600">
          <p>Receipt No: <strong className="text-slate-900 font-mono">{invoiceNo}</strong></p>
          <p>Date: <strong className="text-slate-900">{invoiceDate}</strong></p>
          <p>Rent Month: <strong className="text-indigo-700 font-bold">{rentPeriod}</strong></p>
        </div>
      </div>

      {/* Main Body Statement */}
      <div className="py-6 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800">
        <p>
          Received with thanks a sum of <strong className="text-indigo-900 text-base">{formatIndianCurrency(rentAmount)}</strong>{' '}
          (<em>{amountInWords}</em>) from Mr./Ms.{' '}
          <strong className="text-slate-900 underline underline-offset-4 decoration-indigo-500">{clientName}</strong> towards house rent for the month of{' '}
          <strong className="text-slate-900 font-bold">{rentPeriod}</strong> for the residential property situated at:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium text-slate-900 text-xs">
          📍 <strong>Property Address:</strong> {propertyAddress}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 space-y-1">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">Landlord Details:</span>
            <p>Name: <strong className="text-slate-900">{landlordName}</strong></p>
            <p>PAN Card: <strong className="text-indigo-950 font-mono">{landlordPan || 'N/A'}</strong></p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Payment Details:</span>
            <p>Payment Mode: <strong>{paymentMode}</strong></p>
            <p>Tenant Name: <strong>{clientName}</strong></p>
          </div>
        </div>
      </div>

      {/* Footer & Revenue Stamp Section */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6">
        {/* Revenue Stamp Mockup */}
        <div className="flex items-center gap-3">
          <div className="w-20 h-24 border-2 border-dashed border-red-400 bg-red-50/50 rounded flex flex-col items-center justify-center p-1 text-center shadow-inner">
            <span className="text-[9px] font-bold text-red-700 uppercase">REVENUE STAMP</span>
            <span className="text-xs font-black text-red-800">₹1.00</span>
            <span className="text-[8px] text-red-500 mt-1">AFFIXED</span>
          </div>
          <p className="text-[10px] text-slate-400 max-w-[200px]">
            *Revenue stamp mandatory for rent payments exceeding ₹5,000 per month in cash/transfer.
          </p>
        </div>

        {/* Landlord Signature */}
        <div className="text-right">
          {signatureImage ? (
            <img src={signatureImage} alt="Landlord Signature" className="h-14 ml-auto object-contain mb-1" />
          ) : (
            <div className="h-12 w-40 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center text-[10px] text-slate-400 pb-1">
              (Landlord Signature)
            </div>
          )}
          <p className="font-bold text-slate-900 text-xs">{landlordName}</p>
          <p className="text-[10px] text-slate-500">(Landlord / Property Owner)</p>
        </div>
      </div>
    </div>
  );
}
