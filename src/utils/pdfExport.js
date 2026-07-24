import confetti from 'canvas-confetti';

/**
 * Triggers confetti celebration micro-animation
 */
export function triggerExportConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  });
}

/**
 * High-DPI PDF Export Engine
 * @param {HTMLElement} element - The DOM node to render
 * @param {string} filename - Output file name
 * @param {string} format - 'a4' or 'thermal'
 */
export async function exportElementToPDF(element, filename = 'document.pdf', format = 'a4') {
  if (!element) return;

  try {
    // Dynamic imports — only loaded when user triggers export
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    // 3.0x scale rendering for high-DPI quality
    const canvas = await html2canvas(element, {
      scale: 3.0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    if (format === 'thermal') {
      // 80mm wide thermal receipt format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, Math.max(120, (canvas.height * 80) / canvas.width)]
      });

      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } else {
      // Standard A4 PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    }

    // Trigger visual confetti micro-animation
    triggerExportConfetti();
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
}
