import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as docx from 'docx';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for Vite environment using reliable cdnjs worker
if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Merge multiple PDF files into one single PDF document
 */
export async function mergePDFs(fileList) {
  if (!fileList || fileList.length === 0) {
    throw new Error('Please select at least 2 PDF files.');
  }

  const mergedPdf = await PDFDocument.create();
  for (const file of fileList) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Split PDF: Extract specific range or all pages into a new PDF
 */
export async function splitPDF(file, rangeStr) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();

  let pagesToExtract = [];
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.toLowerCase() === 'all') {
    pagesToExtract = Array.from({ length: totalPages }, (_, i) => i);
  } else {
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

  pagesToExtract = [...new Set(pagesToExtract)];
  if (pagesToExtract.length === 0) {
    pagesToExtract = Array.from({ length: totalPages }, (_, i) => i);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Remove selected page numbers from PDF
 */
export async function removePagesFromPDF(file, pagesToDeleteArray) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
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

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Rotate PDF pages by specified angle (90, 180, 270 degrees)
 */
export async function rotatePDFPages(file, angle = 90) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdf.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  });

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Add Page Numbers to PDF
 */
export async function addPageNumbersToPDF(file, { position = 'bottom-center', format = 'Page {n} of {total}' } = {}) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
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
      color: rgb(0.2, 0.2, 0.2)
    });
  });

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Add Watermark to PDF
 */
export async function watermarkPDF(file, { watermarkText = 'CONFIDENTIAL', opacity = 0.3, size = 48, color = '#6366f1' } = {}) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2) || '63', 16) / 255;
  const g = parseInt(hex.substring(2, 4) || '66', 16) / 255;
  const b = parseInt(hex.substring(4, 6) || 'f1', 16) / 255;

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

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Password Protect PDF document
 */
export async function protectPDF(file, password) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
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
 * Sign PDF with custom signature drawing
 */
export async function signPDF(file, signatureDataUrl, { pageNum = 1, x = 100, y = 100, width = 160, height = 80 } = {}) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

  const imageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
  const signatureImage = await pdf.embedPng(imageBytes);

  const pages = pdf.getPages();
  const targetPage = pages[Math.max(0, Math.min(pages.length - 1, pageNum - 1))];
  const { height: pageHeight } = targetPage.getSize();

  targetPage.drawImage(signatureImage, {
    x: 40,
    y: 40,
    width,
    height
  });

  const pdfBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Convert Images (PNG, JPG, WEBP, GIF, BMP) to PDF
 */
export async function imagesToPDF(fileList, { margin = 10 } = {}) {
  const pdfDoc = await PDFDocument.create();

  for (const file of fileList) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const pngDataUrl = canvas.toDataURL('image/png');
    const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
    const embeddedImage = await pdfDoc.embedPng(pngBytes);

    const pageWidth = embeddedImage.width + margin * 2;
    const pageHeight = embeddedImage.height + margin * 2;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x: margin,
      y: margin,
      width: embeddedImage.width,
      height: embeddedImage.height
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Extract plain text from PDF
 */
export async function extractTextFromPDF(file) {
  try {
    const bytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
        .replace(/[^\x09\x0A\x0D\x20-\x7E\u0900-\u097F]/g, '');
      if (pageText.trim()) {
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
    }

    return fullText.trim() || 'No readable text found in document. Please paste typed text directly.';
  } catch (err) {
    console.warn('PDFJS text extraction error:', err);
    return 'Unable to extract text from scanned PDF. Please type or paste your assignment text in the box below.';
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
 * Convert PDF pages to high-res JPG images ZIP package
 */
export async function pdfToImagesZip(file) {
  const zip = new JSZip();
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
 * Compress PDF (Shrink page canvas resolution & optimize PDF object streams)
 */
export async function compressPDF(file) {
  try {
    const bytes = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    const pdfDoc = await PDFDocument.create();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const imgDataUrl = canvas.toDataURL('image/jpeg', 0.65);
      const imgBytes = await fetch(imgDataUrl).then((r) => r.arrayBuffer());
      const embedded = await pdfDoc.embedJpg(imgBytes);

      const newPage = pdfDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      });
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (err) {
    console.warn('Canvas PDF compress fallback:', err);
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const compressedBytes = await pdf.save({ useObjectStreams: true });
    return new Blob([compressedBytes], { type: 'application/pdf' });
  }
}

/**
 * Text or PDF to Realistic Handwritten Notes Converter
 */
export async function textToHandwrittenPDF(rawText, { fontName = 'Kalam', paperType = 'ruled', inkColor = '#1e3a8a', fontSize = 22 } = {}) {
  // Sanitize rawText to strip binary garbage
  if (typeof rawText === 'string') {
    rawText = rawText.replace(/[^\x09\x0A\x0D\x20-\x7E\u0900-\u097F]/g, '');
  }

  if (!rawText || rawText.trim() === '') {
    rawText = 'Sample Handwritten Notes\n\n1. Introduction to Assignment\nThis document is converted into realistic human handwriting font with notebook paper background and blue ink.';
  }

  // Ensure font is loaded
  await document.fonts.load(`${fontSize}px "${fontName}"`).catch(() => {});

  const pdfDoc = await PDFDocument.create();
  const canvasWidth = 794; // A4 at 96 DPI
  const canvasHeight = 1123;
  const marginTop = 80;
  const marginLeft = 90;
  const marginRight = 60;
  const marginBottom = 80;
  const lineHeight = 36;

  const maxLineWidth = canvasWidth - marginLeft - marginRight;

  // Function to create a paper page canvas
  const createPaperCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Background color
    if (paperType === 'legal') {
      ctx.fillStyle = '#fffdf0';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw lines
    if (paperType === 'ruled' || paperType === 'legal') {
      // Horizontal blue notebook lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let y = marginTop; y < canvasHeight - marginBottom; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      // Vertical red margin line
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marginLeft - 15, 0);
      ctx.lineTo(marginLeft - 15, canvasHeight);
      ctx.stroke();

      if (paperType === 'legal') {
        ctx.beginPath();
        ctx.moveTo(marginLeft - 20, 0);
        ctx.lineTo(marginLeft - 20, canvasHeight);
        ctx.stroke();
      }
    } else if (paperType === 'grid') {
      // Math grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.8;
      for (let x = 0; x < canvasWidth; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }

    ctx.font = `${fontSize}px "${fontName}", cursive, sans-serif`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'alphabetic';
    return { canvas, ctx };
  };

  let { canvas, ctx } = createPaperCanvas();
  let currentY = marginTop + lineHeight - 8;
  const pages = [canvas];

  // Split text into paragraphs and wrap lines
  const paragraphs = rawText.split('\n');

  for (const para of paragraphs) {
    if (para.trim() === '') {
      currentY += lineHeight;
      if (currentY + lineHeight > canvasHeight - marginBottom) {
        const newPaper = createPaperCanvas();
        canvas = newPaper.canvas;
        ctx = newPaper.ctx;
        pages.push(canvas);
        currentY = marginTop + lineHeight - 8;
      }
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxLineWidth && i > 0) {
        // Draw line with subtle handwriting randomness
        ctx.save();
        const jitterY = (Math.random() - 0.5) * 1.5;
        ctx.fillText(currentLine, marginLeft, currentY + jitterY);
        ctx.restore();

        currentLine = words[i];
        currentY += lineHeight;

        if (currentY + lineHeight > canvasHeight - marginBottom) {
          const newPaper = createPaperCanvas();
          canvas = newPaper.canvas;
          ctx = newPaper.ctx;
          pages.push(canvas);
          currentY = marginTop + lineHeight - 8;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      ctx.save();
      const jitterY = (Math.random() - 0.5) * 1.5;
      ctx.fillText(currentLine, marginLeft, currentY + jitterY);
      ctx.restore();
      currentY += lineHeight;

      if (currentY + lineHeight > canvasHeight - marginBottom) {
        const newPaper = createPaperCanvas();
        canvas = newPaper.canvas;
        ctx = newPaper.ctx;
        pages.push(canvas);
        currentY = marginTop + lineHeight - 8;
      }
    }
  }

  // Convert pages canvas array into PDF document
  for (const pCanvas of pages) {
    const imgDataUrl = pCanvas.toDataURL('image/jpeg', 0.95);
    const imgBytes = await fetch(imgDataUrl).then((r) => r.arrayBuffer());
    const embedded = await pdfDoc.embedJpg(imgBytes);
    const page = pdfDoc.addPage([canvasWidth, canvasHeight]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

