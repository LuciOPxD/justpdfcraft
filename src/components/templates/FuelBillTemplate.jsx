import React from 'react';
import { formatIndianCurrency } from '../../utils/numberToWords';

export default function FuelBillTemplate({ data }) {
  const {
    companyName = 'INDIAN OIL CORPORATION LTD',
    companyAddress = 'AUTO CARE CENTRE, C-RING ROAD, NEW DELHI',
    companyPhone = '011-23348899',
    invoiceNo = 'IOCL-77492',
    invoiceDate = '2026-07-25 10:15',
    vehicleNo = 'DL 01 AB 1234',
    fuelType = 'Petrol (Speed)', // Petrol, Diesel, CNG
    density = '745.2 kg/m³',
    pumpNo = 'PUMP 04',
    nozzleNo = 'NOZZLE 02',
    rate = 96.72,
    volume = 36.19, // Litres
    clientName = 'Shaswat Kumar',
    paymentMode = 'UPI / GPay',
    terms = 'Thank you for fueling with Indian Oil! Save Fuel, Save Money.'
  } = data || {};

  const totalAmount = parseFloat(rate || 0) * parseFloat(volume || 0);

  return (
    <div className="w-full flex justify-center p-4">
      <div
        id="printable-document"
        className="w-[330px] bg-white text-slate-900 p-6 shadow-2xl font-mono text-xs leading-tight thermal-tear-edge-top thermal-tear-edge-bottom border border-slate-300"
      >
        {/* Pump Header */}
        <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
          <h2 className="text-sm font-black tracking-wider uppercase text-slate-950">{companyName}</h2>
          <p className="text-[10px] text-slate-700">{companyAddress}</p>
          <p className="text-[10px] text-slate-600">Ph: {companyPhone}</p>
          <span className="inline-block mt-1 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-widest">
            PETROL PUMP RECEIPT
          </span>
        </div>

        {/* Transaction Meta */}
        <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Bill No: <strong>{invoiceNo}</strong></span>
            <span>{invoiceDate.split(' ')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span>Time: {invoiceDate.split(' ')[1] || '10:15'}</span>
            <span>Mode: <strong>{paymentMode}</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Vehicle No: <strong className="uppercase">{vehicleNo}</strong></span>
            <span>Customer: {clientName}</span>
          </div>
        </div>

        {/* Fuel Details Table */}
        <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-500 font-bold border-b border-slate-200 pb-1">
            <span>PRODUCT</span>
            <span>DENSITY</span>
            <span>PUMP/NOZ</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900">
            <span className="uppercase">{fuelType}</span>
            <span>{density}</span>
            <span>{pumpNo}/{nozzleNo}</span>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span>Rate / Litre:</span>
            <span className="font-bold">₹{parseFloat(rate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>Volume (Litres):</span>
            <span className="font-bold">{parseFloat(volume).toFixed(2)} L</span>
          </div>
        </div>

        {/* Total Grand Amount */}
        <div className="py-3 border-b-2 border-slate-900 space-y-1">
          <div className="flex justify-between text-sm sm:text-base font-black text-slate-950">
            <span>NET AMOUNT:</span>
            <span>{formatIndianCurrency(totalAmount)}</span>
          </div>
          <p className="text-[10px] text-slate-500 text-right italic">GST Inclusive</p>
        </div>

        {/* Barcode Mock */}
        <div className="py-3 text-center space-y-1">
          <div className="inline-block bg-slate-950 text-white font-mono text-[9px] tracking-widest px-3 py-1">
            ||| | ||||| || |||||| ||| ||||
          </div>
          <p className="text-[9px] text-slate-500">TXN REF: {invoiceNo}-IOCL</p>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-600 pt-1 space-y-1">
          <p className="font-bold text-slate-800">{terms}</p>
          <p className="text-[9px]">Drive Safe & Wear Seatbelts!</p>
        </div>
      </div>
    </div>
  );
}
