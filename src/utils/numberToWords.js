/**
 * Indian Currency Engine (Rupees in Words with Lakhs & Crores)
 */

const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertChunk(num) {
  let str = '';
  if (num >= 100) {
    str += singleDigits[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 10 && num < 20) {
    str += teens[num - 10] + ' ';
  } else {
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += singleDigits[num] + ' ';
    }
  }
  return str;
}

export function convertNumberToIndianWords(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Zero Rupees Only';
  
  let val = parseFloat(amount);
  if (val === 0) return 'Zero Rupees Only';

  const isNegative = val < 0;
  val = Math.abs(val);

  const rupees = Math.floor(val);
  const paise = Math.round((val - rupees) * 100);

  let words = '';

  if (rupees === 0) {
    words = 'Zero Rupees';
  } else {
    const crore = Math.floor(rupees / 10000000);
    let remainder = rupees % 10000000;

    const lakh = Math.floor(remainder / 100000);
    remainder %= 100000;

    const thousand = Math.floor(remainder / 1000);
    remainder %= 1000;

    const hundredAndBelow = remainder;

    if (crore > 0) {
      words += convertChunk(crore) + 'Crore ';
    }
    if (lakh > 0) {
      words += convertChunk(lakh) + 'Lakh ';
    }
    if (thousand > 0) {
      words += convertChunk(thousand) + 'Thousand ';
    }
    if (hundredAndBelow > 0) {
      words += convertChunk(hundredAndBelow);
    }
    words += 'Rupees';
  }

  if (paise > 0) {
    words += ' and ' + convertChunk(paise) + 'Paise';
  }

  words += ' Only';

  return (isNegative ? 'Minus ' : '') + words.replace(/\s+/g, ' ').trim();
}

export function formatIndianCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  const val = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
}
