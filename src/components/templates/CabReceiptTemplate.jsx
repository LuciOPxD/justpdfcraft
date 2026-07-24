import React from 'react';
import { formatIndianCurrency } from '../../utils/numberToWords';

export default function CabReceiptTemplate({ data }) {
  const {
    companyName = 'UBER TECHNOLOGIES INDIA',
    invoiceNo = 'UBR-TRIP-99201',
    invoiceDate = '2026-07-25 18:45',
    clientName = 'Priya Verma',
    driverName = 'Rajesh Kumar',
    vehicleNo = 'DL 01 Y 8821 (Swift Dzire)',
    pickupLocation = 'Terminal 3, IGI Airport, New Delhi',
    dropLocation = 'DLF Cyber City, Sector 24, Gurgaon',
    distance = '18.4 km',
    duration = '32 mins',
    items = [],
    baseFare = 280,
    tollCharge = 50,
    gstTax = 16.5,
    paymentMode = 'Uber Auto-Pay (GPay)',
    signatureImage = ''
  } = data || {};

  const totalFare = parseFloat(baseFare || 0) + parseFloat(tollCharge || 0) + parseFloat(gstTax || 0);

  return (
    <div
      id="printable-document"
      className="w-full max-w-[600px] mx-auto bg-white text-slate-900 p-8 rounded-2xl shadow-xl font-sans border border-slate-200"
    >
      <div className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">{companyName}</h1>
          <p className="text-xs text-slate-500">Official Trip Receipt & Tax Invoice</p>
        </div>
        <div className="text-right text-xs">
          <span className="inline-block bg-slate-900 text-white font-mono text-[10px] px-2.5 py-1 rounded-full">
            RIDE COMPLETED
          </span>
          <p className="text-slate-500 mt-1">Trip ID: <strong>{invoiceNo}</strong></p>
        </div>
      </div>

      {/* Driver & Vehicle */}
      <div className="py-4 border-b border-slate-100 flex justify-between items-center text-xs">
        <div>
          <span className="text-slate-400 font-bold uppercase text-[10px]">Driver Partner</span>
          <p className="font-bold text-slate-900 text-sm">{driverName}</p>
          <p className="text-slate-500">{vehicleNo}</p>
        </div>
        <div className="text-right">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Rider Name</span>
          <p className="font-bold text-slate-900 text-sm">{clientName}</p>
          <p className="text-slate-500">{invoiceDate}</p>
        </div>
      </div>

      {/* Route Timeline */}
      <div className="py-5 space-y-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shadow-md" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
            <p className="font-semibold text-slate-900">{pickupLocation}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-600 mt-1 shadow-md" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Drop Location</span>
            <p className="font-semibold text-slate-900">{dropLocation}</p>
          </div>
        </div>
        <div className="flex gap-4 pt-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl">
          <span>Distance: <strong className="text-slate-900">{distance}</strong></span>
          <span>Time: <strong className="text-slate-900">{duration}</strong></span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="py-4 border-t border-slate-200 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Base Distance & Time Fare</span>
          <span>₹{parseFloat(baseFare).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Toll & Parking Charges</span>
          <span>₹{parseFloat(tollCharge).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>GST (5%)</span>
          <span>₹{parseFloat(gstTax).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-900">
          <span>Total Fare Paid</span>
          <span>{formatIndianCurrency(totalFare)}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
        <span>Payment Method: {paymentMode}</span>
        <span>Includes GST & Tolls</span>
      </div>
    </div>
  );
}
