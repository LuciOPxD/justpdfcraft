import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Layers, Scissors, Minimize2, Image as ImageIcon, Download, Upload, AlertCircle } from 'lucide-react';
import { triggerExportConfetti } from '../utils/pdfExport';

export default function PDFToolsSuite({ onToast }) {
  const [activeTool, setActiveTool] = useState('merge');
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleMergePDFs = async () => {
    if (files.length < 2) {
      if (onToast) onToast('Please select at least 2 PDF files to merge.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      a.click();
      triggerExportConfetti();
      if (onToast) onToast('PDFs merged successfully! 🎉', 'success');
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Error merging PDF files.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageToPDF = async () => {
    if (files.length === 0) {
      if (onToast) onToast('Please select at least 1 image file.', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let image;
        if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(bytes);
        } else {
          image = await pdfDoc.embedJpg(bytes);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height
        });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.pdf';
      a.click();
      triggerExportConfetti();
      if (onToast) onToast('Images converted to PDF successfully! 🎉', 'success');
    } catch (err) {
      console.error(err);
      if (onToast) onToast('Error converting images to PDF.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-4xl mx-auto">
      {/* Tool selector pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'merge', label: 'Merge PDF', icon: Layers },
          { id: 'img2pdf', label: 'Image to PDF', icon: ImageIcon }
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                setFiles([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-2xl p-8 text-center space-y-3 bg-slate-950/40 transition-colors">
        <Upload className="w-10 h-10 text-indigo-400 mx-auto" />
        <div>
          <h3 className="font-semibold text-white text-sm">
            {activeTool === 'merge' ? 'Select PDF files to merge' : 'Select Images to convert to PDF'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">100% Client-side browser processing — Zero server uploads</p>
        </div>

        <input
          type="file"
          multiple
          accept={activeTool === 'merge' ? '.pdf' : 'image/*'}
          onChange={handleFileChange}
          className="hidden"
          id="pdf-file-input"
        />
        <label
          htmlFor="pdf-file-input"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all shadow-lg shadow-indigo-600/30"
        >
          Browse Files
        </label>
      </div>

      {/* Selected files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Selected Files ({files.length}):
          </h4>
          <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
            {files.map((file, idx) => (
              <div key={idx} className="p-2.5 text-xs text-slate-300 flex items-center justify-between">
                <span className="truncate max-w-md font-medium">{file.name}</span>
                <span className="text-slate-500 text-[10px]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))}
          </div>

          <div className="pt-3">
            <button
              onClick={activeTool === 'merge' ? handleMergePDFs : handleImageToPDF}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Processing PDF...' : `Execute ${activeTool === 'merge' ? 'PDF Merge' : 'Image to PDF'}`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
