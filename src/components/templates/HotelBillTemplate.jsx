import React from 'react';
import { formatIndianCurrency } from '../../utils/numberToWords';

export default function HotelBillTemplate({ data }) {
  const {
    companyName = 'ROYAL PALACE RESTAURANT & BAR',
    companyAddress = 'Sector 18 Market, Noida, Uttar Pradesh',
    companyPhone = '+91 120 4567890',
    invoiceNo = 'TBL-1029',
    invoiceDate = '2026-07-25 21:10',
    tableNo = 'Table #08',
    stewardName = 'Vikram',
    clientName = 'Guest',
    items = [],
    taxRate = 5,
    discount = 0,
    serviceCharge = 5,
    signatureImage = ''
  } = data || {};

  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const discountAmount = (subtotal * parseFloat(discount || 0)) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const serviceChargeAmt = (taxableAmount * parseFloat(serviceCharge || 0)) / 100;
  const taxAmount = (taxableAmount * parseFloat(taxRate || 0)) / 100;
  const grandTotal = taxableAmount + serviceChargeAmt + taxAmount;

  return (
    <div className="w-full flex justify-center p-4">
      <div
        id="printable-document"
        className="w-[330px] bg-white text-slate-900 p-6 shadow-2xl font-mono text-xs leading-tight thermal-tear-edge-top thermal-tear-edge-bottom border border-slate-300"
      >
        <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
          <h2 className="text-sm font-black uppercase text-slate-950">{companyName}</h2>
          <p className="text-[10px] text-slate-600">{companyAddress}</p>
          <p className="text-[10px] text-slate-600">Ph: {companyPhone}</p>
        </div>

        <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-1">
          <div className="flex justify-between font-bold">
            <span>Bill: {invoiceNo}</span>
            <span>{tableNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Server: {stewardName}</span>
            <span>{invoiceDate.split(' ')[1] || '21:10'}</span>
          </div>
        </div>

        <div className="py-3 border-b border-dashed border-slate-400">
          <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-slate-200">
            <span>ITEM</span>
            <span>QTY</span>
            <span className="text-right">AMOUNT</span>
          </div>
          <div className="space-y-1.5 pt-1.5">
            {items.map((item, idx) => {
              const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
              return (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="truncate max-w-[140px] font-medium">{item.description}</span>
                  <span>{item.quantity}</span>
                  <span className="font-bold text-right">₹{itemTotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="py-3 border-b-2 border-slate-900 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {serviceCharge > 0 && (
            <div className="flex justify-between">
              <span>Service Charge ({serviceCharge}%):</span>
              <span>₹{serviceChargeAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST ({taxRate}%):</span>
            <span>₹{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-900">
            <span>TOTAL:</span>
            <span>{formatIndianCurrency(grandTotal)}</span>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-600 pt-3 space-y-1">
          <p className="font-bold uppercase">THANK YOU FOR DINING WITH US!</p>
          <p className="text-[9px]">Please Visit Again</p>
        </div>
      </div>
    </div>
  );
}
