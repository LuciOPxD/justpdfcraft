import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as docx from 'docx';
import JSZip from 'jszip';

/**
 * Merge multiple PDF files into one single PDF document
 */
export async function mergePDFs(fileList) {
  const mergedPdf = await PDFDocument.create();
  for (const file of fileList) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Split PDF: Extract specific range or all pages into separate PDFs or single extracted PDF
 */
export async function splitPDF(file, rangeStr) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();

  let pagesToExtract = [];
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.toLowerCase() === 'all') {
    pagesToExtract = Array.from({ length: totalPages }, (_, i) => i);
  } else {
    // Parse range e.g. "1, 3-5, 7"
    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
            pagesToExtract.push(p - 1);
          }
        }
      } else {
        const pageNum = parseInt(trimmed, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pagesToExtract.push(pageNum - 1);
        }
      }
    }
  }

  // Remove duplicates and keep relative order
  pagesToExtract = [...new Set(pagesToExtract)];
  if (pagesToExtract.length === 0) {
    pagesToExtract = Array.from({ length: totalPages }, (_, i) => i);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Remove selected page indices (1-indexed array of page numbers to delete)
 */
export async function removePagesFromPDF(file, pagesToDeleteArray) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();

  const pagesToKeep = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!pagesToDeleteArray.includes(i)) {
      pagesToKeep.push(i - 1);
    }
  }

  const newPdf = await PDFDocument.create();
  if (pagesToKeep.length > 0) {
    const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
    copiedPages.forEach((page) => newPdf.addPage(page));
  }

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Rotate PDF pages by specified angle (90, 180, 270 degrees)
 */
export async function rotatePDFPages(file, angle = 90) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Add Page Numbers to PDF document
 */
export async function addPageNumbersToPDF(file, { position = 'bottom-center', format = 'Page {n} of {total}' } = {}) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const pages = pdf.getPages();
  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNum = index + 1;
    const text = format.replace('{n}', pageNum).replace('{total}', totalPages);
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = width / 2 - textWidth / 2;
    let y = 20;

    if (position === 'bottom-left') x = 30;
    if (position === 'bottom-right') x = width - textWidth - 30;
    if (position === 'top-center') y = height - 30;
    if (position === 'top-left') { x = 30; y = height - 30; }
    if (position === 'top-right') { x = width - textWidth - 30; y = height - 30; }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Add Watermark to PDF
 */
export async function watermarkPDF(file, { watermarkText = 'CONFIDENTIAL', opacity = 0.3, size = 48, color = '#ff0000' } = {}) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Convert hex color to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2) || 'ff', 16) / 255;
  const g = parseInt(hex.substring(2, 4) || '00', 16) / 255;
  const b = parseInt(hex.substring(4, 6) || '00', 16) / 255;

  const pages = pdf.getPages();
  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, size);
    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size,
      font,
      color: rgb(r, g, b),
      opacity: parseFloat(opacity),
      rotate: degrees(45)
    });
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Password Protect PDF document
 */
export async function protectPDF(file, password) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  pdf.encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: true,
      annotating: false,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false
    }
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Sign PDF with custom signature data URL or image
 */
export async function signPDF(file, signatureDataUrl, { pageNum = 1, x = 100, y = 100, width = 150, height = 75 } = {}) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  // Embed PNG signature image
  const imageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  const signatureImage = await pdf.embedPng(imageBytes);

  const pages = pdf.getPages();
  const targetPage = pages[Math.max(0, Math.min(pages.length - 1, pageNum - 1))];

  targetPage.drawImage(signatureImage, {
    x,
    y,
    width,
    height
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Convert Images to PDF
 */
export async function imagesToPDF(fileList, { margin = 10, orientation = 'portrait' } = {}) {
  const pdfDoc = await PDFDocument.create();

  for (const file of fileList) {
    const bytes = await file.arrayBuffer();
    let image;
    if (file.type.includes('png')) {
      image = await pdfDoc.embedPng(bytes);
    } else {
      image = await pdfDoc.embedJpg(bytes);
    }

    let pageWidth = image.width + margin * 2;
    let pageHeight = image.height + margin * 2;

    if (orientation === 'landscape' && pageWidth < pageHeight) {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: margin,
      y: margin,
      width: image.width,
      height: image.height
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Extract plain text from PDF using PDFJS or browser array buffer reader fallback
 */
export async function extractTextFromPDF(file) {
  try {
    const pdfjsLib = window.pdfjsLib || await import('pdfjs-dist');
    const bytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText;
  } catch (err) {
    console.warn('PDFJS fallback text parsing:', err);
    const bytes = await file.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const rawText = decoder.decode(bytes);
    const matches = rawText.match(/\(([^()]+)\)/g);
    if (matches) {
      return matches.map((m) => m.replace(/[()]/g, '')).filter((t) => t.length > 2).join(' ');
    }
    return 'Extracted Text:\n(Text contents extracted from document stream)';
  }
}

/**
 * Convert PDF to Word (.docx) document
 */
export async function pdfToDocx(file) {
  const text = await extractTextFromPDF(file);
  const lines = text.split('\n');

  const doc = new docx.Document({
    sections: [
      {
        properties: {},
        children: lines.map((line) => {
          if (line.startsWith('--- Page')) {
            return new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: line,
                  bold: true,
                  size: 24,
                  color: '4F46E5'
                })
              ]
            });
          }
          return new docx.Paragraph({
            children: [new docx.TextRun({ text: line, size: 20 })]
          });
        })
      }
    ]
  });

  return await docx.Packer.toBlob(doc);
}

/**
 * Convert PDF pages to JPG images ZIP package
 */
export async function pdfToImagesZip(file) {
  const zip = new JSZip();
  const pdfjsLib = window.pdfjsLib || await import('pdfjs-dist');
  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64Data = dataUrl.split(',')[1];
    zip.file(`page_${i}.jpg`, base64Data, { base64: true });
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Compress PDF (Re-encode streams & compress PDF object structure)
 */
export async function compressPDF(file) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  
  const compressedBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([compressedBytes], { type: 'application/pdf' });
}
