import React from 'react';
import { formatIndianCurrency } from '../../utils/numberToWords';

export default function ThermalReceiptTemplate({ data }) {
  const {
    companyName = 'METRO SUPERMARKET',
    companyAddress = 'Store #104, Connaught Place, New Delhi',
    companyPhone = '+91 11 2345 6789',
    invoiceNo = 'POS-99201',
    invoiceDate = '2026-07-25 14:32',
    clientName = 'Cash Customer',
    items = [],
    taxRate = 5,
    discount = 0,
    terms = 'Goods once sold cannot be returned after 7 days.',
    signatureImage = ''
  } = data || {};

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const discountAmount = (subtotal * parseFloat(discount || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * parseFloat(taxRate || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="w-full flex justify-center p-4">
      {/* 80mm Thermal Receipt Card with tear edges */}
      <div
        id="printable-document"
        className="w-[320px] bg-white text-black p-5 shadow-2xl font-mono text-xs leading-tight thermal-tear-edge-top thermal-tear-edge-bottom border border-slate-300"
      >
        {/* Header */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
          <h2 className="text-base font-black tracking-tighter uppercase">{companyName}</h2>
          <p className="text-[11px]">{companyAddress}</p>
          <p className="text-[11px]">Ph: {companyPhone}</p>
        </div>

        {/* Meta Info */}
        <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Rcpt #: {invoiceNo}</span>
            <span>{invoiceDate.split(' ')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer: {clientName}</span>
            <span>Time: {invoiceDate.split(' ')[1] || '12:00'}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-3 border-b border-dashed border-black">
          <div className="flex justify-between font-bold pb-1 text-[11px]">
            <span className="w-1/2">ITEM</span>
            <span className="w-1/4 text-center">QTYxRATE</span>
            <span className="w-1/4 text-right">AMT</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {items.map((item, idx) => {
              const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
              return (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <span className="w-1/2 truncate font-semibold">{item.description}</span>
                  <span className="w-1/4 text-center">{item.quantity}x{item.rate}</span>
                  <span className="w-1/4 text-right font-bold">₹{itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="py-3 border-b border-dashed border-black space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-black">
              <span>Discount ({discount}%):</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST Tax ({taxRate}%):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-black pt-1 border-t border-black">
            <span>TOTAL:</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Barcode Mockup */}
        <div className="py-4 text-center space-y-1">
          <div className="inline-block bg-black text-white font-mono text-[10px] tracking-widest px-4 py-1">
            |||||||| ||| ||||||| |||| ||||
          </div>
          <p className="text-[10px]">{invoiceNo}</p>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] space-y-1 pt-1">
          <p className="font-bold uppercase">THANK YOU FOR YOUR VISIT!</p>
          <p className="text-slate-700">{terms}</p>
          {signatureImage && (
            <div className="pt-2">
              <img src={signatureImage} alt="Sig" className="h-8 mx-auto object-contain" />
              <p className="text-[9px]">Verified Stamp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
