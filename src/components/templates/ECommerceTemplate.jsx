import React from 'react';
import { formatIndianCurrency } from '../../utils/numberToWords';

export default function ECommerceTemplate({ data }) {
  const {
    companyName = 'AMAZON SELLER SERVICES PVT LTD',
    companyAddress = 'Fulfilment Centre, Plot 14, Industrial Area, Bhiwandi',
    invoiceNo = 'IN-AMZ-2026-9812',
    invoiceDate = '2026-07-25',
    orderId = '408-1234567-8901234',
    orderDate = '2026-07-24',
    clientName = 'Anish Mehta',
    clientAddress = 'House 12, Park Street, Indiranagar, Bengaluru - 560038',
    items = [],
    taxRate = 18,
    discount = 0,
    paymentMode = 'Prepaid (Credit Card)',
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
      className="w-full max-w-[780px] mx-auto bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-xl font-sans text-xs border border-slate-200"
    >
      <div className="flex justify-between items-start pb-6 border-b-2 border-amber-500">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">{companyName}</h1>
          <p className="text-slate-500 text-[11px]">{companyAddress}</p>
        </div>
        <div className="text-right">
          <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded text-xs">
            TAX INVOICE / RETAIL BILL
          </span>
          <p className="mt-2">Invoice #: <strong>{invoiceNo}</strong></p>
          <p>Order ID: <strong className="font-mono">{orderId}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase">Shipping & Billing Address:</span>
          <p className="font-bold text-slate-900 text-sm mt-1">{clientName}</p>
          <p className="text-slate-600 whitespace-pre-line leading-relaxed">{clientAddress}</p>
        </div>
        <div className="text-right space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Order Details:</span>
          <p>Order Date: <strong>{orderDate}</strong></p>
          <p>Invoice Date: <strong>{invoiceDate}</strong></p>
          <p>Payment Mode: <strong>{paymentMode}</strong></p>
        </div>
      </div>

      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <th className="p-2.5">Product Title</th>
              <th className="p-2.5 text-center">Qty</th>
              <th className="p-2.5 text-right">Price</th>
              <th className="p-2.5 text-right">Tax ({taxRate}%)</th>
              <th className="p-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
              const itemTax = (itemTotal * taxRate) / 100;
              return (
                <tr key={idx}>
                  <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                  <td className="p-2.5 text-center">{item.quantity}</td>
                  <td className="p-2.5 text-right">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                  <td className="p-2.5 text-right">₹{itemTax.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">₹{(itemTotal + itemTax).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-end pt-4 border-t-2 border-slate-900">
        <div className="text-[10px] text-slate-500 max-w-xs">
          <p className="font-bold text-slate-800">Return Policy:</p>
          <p>Returns accepted within 10 days of delivery. Keep invoice intact for warranty.</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-slate-600">Grand Total:</p>
          <p className="text-xl font-black text-amber-700">{formatIndianCurrency(grandTotal)}</p>
        </div>
      </div>
    </div>
  );
}
