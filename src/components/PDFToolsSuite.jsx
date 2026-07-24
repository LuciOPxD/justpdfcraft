import React, { useState, useRef } from 'react';
import {
  Layers,
  Scissors,
  Minimize2,
  Image as ImageIcon,
  Download,
  Upload,
  RotateCw,
  Hash,
  Stamp,
  Lock,
  Unlock,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileEdit,
  Trash2,
  Search,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  PenTool,
  ArrowRight,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { triggerExportConfetti } from '../utils/pdfExport';
import {
  mergePDFs,
  splitPDF,
  removePagesFromPDF,
  rotatePDFPages,
  addPageNumbersToPDF,
  watermarkPDF,
  protectPDF,
  signPDF,
  imagesToPDF,
  pdfToImagesZip,
  extractTextFromPDF,
  pdfToDocx,
  compressPDF,
  textToHandwrittenPDF
} from '../utils/pdfEngine';

const TOOLS_CONFIG = [
  // ORGANIZE
  {
    id: 'merge',
    name: 'Merge PDF',
    category: 'organize',
    icon: Layers,
    badge: 'Popular',
    desc: 'Combine multiple PDF files into one single organized document in seconds.',
    accept: '.pdf',
    multiple: true
  },
  {
    id: 'split',
    name: 'Split PDF',
    category: 'organize',
    icon: Scissors,
    badge: 'Essential',
    desc: 'Extract specific pages or page ranges into a separate PDF file.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'remove_pages',
    name: 'Remove Pages',
    category: 'organize',
    icon: Trash2,
    badge: 'Utility',
    desc: 'Delete unneeded pages from your PDF document easily.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    category: 'edit',
    icon: RotateCw,
    badge: 'Quick',
    desc: 'Rotate PDF pages clockwise or counter-clockwise by 90°, 180° or 270°.',
    accept: '.pdf',
    multiple: false
  },
  // OPTIMIZE
  {
    id: 'compress',
    name: 'Compress PDF',
    category: 'optimize',
    icon: Minimize2,
    badge: 'Fast',
    desc: 'Optimize & shrink PDF file size while maintaining visual quality.',
    accept: '.pdf',
    multiple: false
  },
  // CONVERT TO PDF
  {
    id: 'img2pdf',
    name: 'JPG to PDF',
    category: 'convert_to',
    icon: ImageIcon,
    badge: 'Popular',
    desc: 'Convert PNG, JPG, or WebP images into a clean PDF document.',
    accept: 'image/*',
    multiple: true
  },
  // CONVERT FROM PDF
  {
    id: 'pdf2jpg',
    name: 'PDF to JPG',
    category: 'convert_from',
    icon: FolderArchive,
    badge: 'Extract',
    desc: 'Convert every PDF page into high-resolution JPG images packaged in ZIP.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'pdf2word',
    name: 'PDF to Word',
    category: 'convert_from',
    icon: FileText,
    badge: 'DOCX',
    desc: 'Extract content from PDF into editable Microsoft Word (.docx) format.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'pdf2txt',
    name: 'PDF to Text',
    category: 'convert_from',
    icon: FileCode,
    badge: 'TXT',
    desc: 'Extract raw text strings from PDF documents.',
    accept: '.pdf',
    multiple: false
  },
  // EDIT & STYLING
  {
    id: 'page_numbers',
    name: 'Add Page Numbers',
    category: 'edit',
    icon: Hash,
    badge: 'Formatting',
    desc: 'Stamp page numbers in customizable positions and formats.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'watermark',
    name: 'Watermark PDF',
    category: 'edit',
    icon: Stamp,
    badge: 'Branding',
    desc: 'Add text watermark stamps with custom opacity, rotation & colors.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'sign',
    name: 'Sign PDF',
    category: 'edit',
    icon: PenTool,
    badge: 'Signature',
    desc: 'Draw or upload an electronic signature and stamp it onto your PDF.',
    accept: '.pdf',
    multiple: false
  },
  {
    id: 'handwritten',
    name: 'Text & PDF to Handwritten Notes',
    category: 'edit',
    icon: FileEdit,
    badge: '★ Student Special',
    desc: 'Directly type text or upload PDF/TXT notes to convert into realistic human handwritten notebook assignments.',
    accept: '.pdf,.txt',
    multiple: false,
    noUpload: true
  },
  // SECURITY
  {
    id: 'protect',
    name: 'Protect PDF',
    category: 'security',
    icon: Lock,
    badge: 'Security',
    desc: 'Encrypt and add strong user password protection to your PDF.',
    accept: '.pdf',
    multiple: false
  }
];

export default function PDFToolsSuite({ onToast, activeCategory: externalCategory, setActiveCategory: externalSetCategory }) {
  const [internalCategory, setInternalCategory] = useState('all');
  const activeCategory = externalCategory !== undefined ? externalCategory : internalCategory;
  const setActiveCategory = externalSetCategory || setInternalCategory;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tool Specific Options
  const [splitRange, setSplitRange] = useState('1-2');
  const [removePagesStr, setRemovePagesStr] = useState('2');
  const [rotateAngle, setRotateAngle] = useState(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState('#6366f1');
  const [watermarkOpacity, setWatermarkOpacity] = useState('0.3');
  const [pageNumPosition, setPageNumPosition] = useState('bottom-center');
  const [pageNumFormat, setPageNumFormat] = useState('Page {n} of {total}');
  const [pdfPassword, setPdfPassword] = useState('');
  const [extractedTextPreview, setExtractedTextPreview] = useState('');

  // Handwritten Notes Generator Options
  const [handwritingFont, setHandwritingFont] = useState('Kalam');
  const [paperStyle, setPaperStyle] = useState('ruled');
  const [inkColor, setInkColor] = useState('#1e3a8a');
  const [handwritingText, setHandwritingText] = useState(
    'Assignment 1: Quantum Physics Overview\n\nQuantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.\n\nKey Concepts:\n1. Wave-Particle Duality\n2. Uncertainty Principle\n3. Quantum Entanglement'
  );

  // Signature Pad & Live Preview Refs
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  // Live Canvas Preview for Handwritten Notes
  React.useEffect(() => {
    if (selectedTool?.id !== 'handwritten' && selectedTool?.id !== 'type2handwritten') return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 500;
    const height = 660;
    canvas.width = width;
    canvas.height = height;

    const marginTop = 45;
    const marginLeft = 55;
    const marginRight = 35;
    const marginBottom = 45;
    const lineHeight = 24;

    // Paper Background
    if (paperStyle === 'legal') {
      ctx.fillStyle = '#fffdf0';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);

    // Lines & Margins
    if (paperStyle === 'ruled' || paperStyle === 'legal') {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let y = marginTop; y < height - marginBottom; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marginLeft - 10, 0);
      ctx.lineTo(marginLeft - 10, height);
      ctx.stroke();
    } else if (paperStyle === 'grid') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.8;
      for (let x = 0; x < width; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    const fontSize = 15;
    ctx.font = `${fontSize}px "${handwritingFont}", cursive, sans-serif`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'alphabetic';

    const maxLineWidth = width - marginLeft - marginRight;
    let currentY = marginTop + lineHeight - 5;

    const cleanText = (handwritingText || '').replace(/[^\x09\x0A\x0D\x20-\x7E\u0900-\u097F]/g, '');
    const paragraphs = cleanText.split('\n');

    for (const para of paragraphs) {
      if (currentY > height - marginBottom) break;
      if (para.trim() === '') {
        currentY += lineHeight;
        continue;
      }
      const words = para.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width > maxLineWidth && i > 0) {
          ctx.fillText(currentLine, marginLeft, currentY);
          currentLine = words[i];
          currentY += lineHeight;
          if (currentY > height - marginBottom) break;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine && currentY <= height - marginBottom) {
        ctx.fillText(currentLine, marginLeft, currentY);
        currentY += lineHeight;
      }
    }
  }, [selectedTool?.id, handwritingText, handwritingFont, paperStyle, inkColor]);

  // Filter tools
  const filteredTools = TOOLS_CONFIG.filter((t) => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setFiles([]);
    setExtractedTextPreview('');
    setSignatureData(null);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    if (selectedTool?.multiple) {
      setFiles((prev) => [...prev, ...selected]);
    } else {
      setFiles(selected);
    }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    if (!dropped.length) return;
    if (selectedTool?.multiple) {
      setFiles((prev) => [...prev, ...dropped]);
    } else {
      setFiles(dropped.slice(0, 1));
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveFile = (index, direction) => {
    setFiles((prev) => {
      const updated = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return updated;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Signature Pad Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  // Execution Switcher
  const handleExecuteTool = async () => {
    if (!selectedTool) return;
    if (!selectedTool.noUpload && files.length === 0 && selectedTool.id !== 'handwritten' && selectedTool.id !== 'type2handwritten') {
      if (onToast) onToast('Please select file(s) to proceed.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      let outputBlob = null;
      let filename = `processed_${Date.now()}.pdf`;

      switch (selectedTool.id) {
        case 'merge':
          if (files.length < 2) {
            if (onToast) onToast('Please select at least 2 PDF files to merge.', 'error');
            setIsProcessing(false);
            return;
          }
          outputBlob = await mergePDFs(files);
          filename = 'merged_document.pdf';
          break;

        case 'split':
          outputBlob = await splitPDF(files[0], splitRange);
          filename = 'split_pages.pdf';
          break;

        case 'remove_pages':
          const pagesToDelete = removePagesStr
            .split(',')
            .map((p) => parseInt(p.trim(), 10))
            .filter((p) => !isNaN(p));
          outputBlob = await removePagesFromPDF(files[0], pagesToDelete);
          filename = 'pages_removed.pdf';
          break;

        case 'rotate':
          outputBlob = await rotatePDFPages(files[0], rotateAngle);
          filename = 'rotated_document.pdf';
          break;

        case 'compress':
          outputBlob = await compressPDF(files[0]);
          filename = 'compressed_document.pdf';
          break;

        case 'img2pdf':
          outputBlob = await imagesToPDF(files);
          filename = 'converted_images.pdf';
          break;

        case 'pdf2jpg':
          outputBlob = await pdfToImagesZip(files[0]);
          filename = 'pdf_pages_images.zip';
          break;

        case 'pdf2word':
          outputBlob = await pdfToDocx(files[0]);
          filename = 'converted_document.docx';
          break;

        case 'pdf2txt':
          const text = await extractTextFromPDF(files[0]);
          setExtractedTextPreview(text);
          outputBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          filename = 'extracted_text.txt';
          break;

        case 'page_numbers':
          outputBlob = await addPageNumbersToPDF(files[0], {
            position: pageNumPosition,
            format: pageNumFormat
          });
          filename = 'numbered_document.pdf';
          break;

        case 'watermark':
          outputBlob = await watermarkPDF(files[0], {
            watermarkText,
            opacity: parseFloat(watermarkOpacity),
            color: watermarkColor
          });
          filename = 'watermarked_document.pdf';
          break;

        case 'protect':
          if (!pdfPassword || pdfPassword.trim() === '') {
            if (onToast) onToast('Please enter a password to protect the PDF.', 'error');
            setIsProcessing(false);
            return;
          }
          outputBlob = await protectPDF(files[0], pdfPassword);
          filename = 'protected_document.pdf';
          break;

        case 'sign':
          if (!signatureData) {
            if (onToast) onToast('Please draw or create your signature first.', 'error');
            setIsProcessing(false);
            return;
          }
          outputBlob = await signPDF(files[0], signatureData);
          filename = 'signed_document.pdf';
          break;

        case 'type2handwritten':
        case 'handwritten':
          let textForNotes = handwritingText;
          if (files.length > 0) {
            if (files[0].name.endsWith('.txt')) {
              textForNotes = await files[0].text();
            } else if (files[0].name.endsWith('.pdf')) {
              textForNotes = await extractTextFromPDF(files[0]);
            }
          }
          outputBlob = await textToHandwrittenPDF(textForNotes, {
            fontName: handwritingFont,
            paperType: paperStyle,
            inkColor: inkColor,
            fontSize: 22
          });
          filename = 'handwritten_notes_assignment.pdf';
          break;

        default:
          break;
      }

      if (outputBlob) {
        const url = URL.createObjectURL(outputBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        triggerExportConfetti();
        if (onToast) onToast(`${selectedTool.name} completed successfully! 🎉`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast(`Error executing ${selectedTool.name}.`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* iLovePDF Header & Search Section */}
      <div className="bg-gradient-to-b from-[#0b1120] to-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete iLovePDF Client-Side Suite</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Every tool you need to work with PDFs in one place
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          100% Client-Side In-Browser Processing — Zero Server Uploads — Fast & Privately Encrypted.
        </p>

        {/* Search & Filter Bar */}
        <div className="max-w-xl mx-auto flex items-center bg-[#080c14] border border-slate-700/80 rounded-2xl p-2 shadow-lg">
          <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
          <input
            type="text"
            placeholder="Search PDF tools (e.g. Merge, Split, Watermark, Protect, JPG to PDF)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills & Quick Launcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'organize', label: 'Organize PDF' },
            { id: 'optimize', label: 'Optimize PDF' },
            { id: 'convert_to', label: 'Convert to PDF' },
            { id: 'convert_from', label: 'Convert from PDF' },
            { id: 'edit', label: 'Edit & Format' },
            { id: 'security', label: 'PDF Security' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              const handwrittenTool = TOOLS_CONFIG.find((t) => t.id === 'handwritten');
              if (handwrittenTool) handleSelectTool(handwrittenTool);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white text-xs font-black shadow-xl shadow-pink-600/30 hover:scale-105 transition-all cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-pink-200" />
            <span>Launch Handwritten Notes Studio (Live Real-Time Preview) ✨</span>
          </button>
        </div>
      </div>

      {/* Active Selected Tool Modal/Workspace OR Grid of Tools */}
      {selectedTool ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
          {/* Top Bar of Workspace */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <selectedTool.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{selectedTool.name}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedTool.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedTool.desc}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTool(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
            >
              ← Back to All Tools
            </button>
          </div>

          {/* File Upload Zone OR Direct Typing Banner */}
          {selectedTool.noUpload ? (
            <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-6 text-center space-y-2 shadow-xl">
              <div className="inline-flex items-center gap-2 text-indigo-300 font-extrabold text-sm">
                <PenTool className="w-5 h-5 text-indigo-400" />
                <span>Direct Typing Workspace — Type & Customize Handwritten Assignment Below</span>
              </div>
              <p className="text-xs text-slate-400">
                No file upload needed! Simply edit your text in the workspace below and watch your handwritten notebook page generate live.
              </p>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-3xl p-8 text-center space-y-4 bg-[#080c14] transition-all"
            >
              <Upload className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-base">
                  {selectedTool.multiple ? 'Select or Drag 1 or more PDF files' : 'Select or Drag PDF document'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Client-side processing — No files leave your device
                </p>
              </div>

              <input
                type="file"
                multiple={selectedTool.multiple}
                accept={selectedTool.accept}
                onChange={handleFileChange}
                className="hidden"
                id="tool-file-input"
              />
              <div className="flex items-center justify-center gap-3">
                <label
                  htmlFor="tool-file-input"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold cursor-pointer transition-all shadow-xl shadow-indigo-600/30"
                >
                  <Upload className="w-4 h-4" />
                  <span>{files.length > 0 ? '+ Add More Files' : 'Browse Files'}</span>
                </label>
              </div>
            </div>
          )}

          {/* Tool Workspace Panel */}
          {(selectedTool.id === 'type2handwritten' || selectedTool.id === 'handwritten') ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#080c14] border border-slate-800 rounded-3xl p-6 sm:p-8">
              {/* Left Column: Controls & Text Input Area */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-indigo-400" />
                    <span>Assignment Text & Styling Studio</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Real-Time Generator
                  </span>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold block">Handwriting Font:</label>
                    <select
                      value={handwritingFont}
                      onChange={(e) => setHandwritingFont(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white mt-1 font-semibold focus:border-indigo-500"
                    >
                      <option value="Kalam">Kalam (Cursive)</option>
                      <option value="Caveat">Caveat (Flowing)</option>
                      <option value="Dancing Script">Dancing Script (Elegant)</option>
                      <option value="Patrick Hand">Patrick Hand (Neat)</option>
                      <option value="Shadows Into Light">Shadows Into Light (Quick)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold block">Paper Background:</label>
                    <select
                      value={paperStyle}
                      onChange={(e) => setPaperStyle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white mt-1 font-semibold focus:border-indigo-500"
                    >
                      <option value="ruled">Blue Ruled Notebook Line</option>
                      <option value="legal">Yellow Legal Pad</option>
                      <option value="grid">Math Grid Paper</option>
                      <option value="plain">Blank White Paper</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-400 font-semibold">Ink Color:</label>
                  <div className="flex gap-2">
                    {[
                      { color: '#1e3a8a', label: 'Royal Blue' },
                      { color: '#000000', label: 'Black Pen' },
                      { color: '#dc2626', label: 'Red Pen' }
                    ].map((ink) => (
                      <button
                        key={ink.color}
                        onClick={() => setInkColor(ink.color)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          inkColor === ink.color
                            ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-lg'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: ink.color }} />
                        <span>{ink.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Option for PDF / File Mode */}
                {selectedTool.id === 'handwritten' && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                    <label className="text-xs text-slate-300 font-bold block">
                      Optional: Upload PDF or TXT to extract text automatically:
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                    {files.length > 0 && (
                      <p className="text-[11px] text-emerald-400 font-bold">
                        Loaded: {files[0].name}
                      </p>
                    )}
                  </div>
                )}

                {/* Textarea */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1">
                    Type or Paste Assignment Text Below:
                  </label>
                  <textarea
                    rows={8}
                    value={handwritingText}
                    onChange={(e) => setHandwritingText(e.target.value)}
                    placeholder="Type or paste your assignment text here..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                  />
                </div>
              </div>

              {/* Right Column: Live Real-Time Notebook Sheet Preview */}
              <div className="space-y-3 flex flex-col items-center justify-center bg-[#050810] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Live Notebook Page 1 Preview
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 font-mono">
                    Live Rendering
                  </span>
                </div>

                <div className="w-full flex justify-center py-2">
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full max-w-[380px] h-auto rounded-xl shadow-2xl border border-slate-300"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Changes render instantly on this preview sheet as you type.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#080c14] border border-slate-800 rounded-2xl p-6">
              {/* Left: Files List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Selected Files ({files.length}):</span>
                  <div className="flex items-center gap-3">
                    {selectedTool.multiple && (
                      <label htmlFor="tool-file-input" className="text-indigo-400 hover:underline text-[11px] cursor-pointer font-bold">
                        + Add File
                      </label>
                    )}
                    {files.length > 0 && (
                      <button onClick={() => setFiles([])} className="text-red-400 hover:underline text-[11px]">
                        Remove All
                      </button>
                    )}
                  </div>
                </h4>

                {files.length === 0 ? (
                  <div className="p-6 border border-slate-800/80 rounded-xl text-center text-xs text-slate-500">
                    No files selected yet. Click "Browse Files" or drag & drop files here.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="truncate flex-1">
                          <p className="font-bold text-slate-200 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {selectedTool.multiple && (
                            <div className="flex items-center gap-0.5">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveFile(idx, -1)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] disabled:opacity-30"
                                title="Move Up"
                              >
                                ▲
                              </button>
                              <button
                                disabled={idx === files.length - 1}
                                onClick={() => handleMoveFile(idx, 1)}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] disabled:opacity-30"
                                title="Move Down"
                              >
                                ▼
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                            #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveFile(idx)}
                            className="p-1 text-red-400 hover:bg-red-950/40 rounded transition-colors"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Tool Config Parameters */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Tool Parameters & Configuration:
                </h4>

                {selectedTool.id === 'split' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">Page Range to Extract (e.g. 1-3, 5):</label>
                    <input
                      type="text"
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="e.g. 1-2 or 1,3,5"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}

                {selectedTool.id === 'remove_pages' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">Page Numbers to Remove (comma separated):</label>
                    <input
                      type="text"
                      value={removePagesStr}
                      onChange={(e) => setRemovePagesStr(e.target.value)}
                      placeholder="e.g. 2, 4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}

                {selectedTool.id === 'rotate' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">Rotation Angle:</label>
                    <div className="flex gap-2">
                      {[90, 180, 270].map((angle) => (
                        <button
                          key={angle}
                          onClick={() => setRotateAngle(angle)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            rotateAngle === angle
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {angle}° Clockwise
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTool.id === 'watermark' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 font-semibold">Watermark Text:</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-xs text-slate-400 font-semibold block">Stamp Color:</label>
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-10 h-8 bg-transparent cursor-pointer mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-400 font-semibold block">Opacity: {watermarkOpacity}</label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(e.target.value)}
                          className="w-full mt-1 accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedTool.id === 'page_numbers' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 font-semibold">Number Position:</label>
                      <select
                        value={pageNumPosition}
                        onChange={(e) => setPageNumPosition(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white mt-1"
                      >
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-semibold">Format:</label>
                      <input
                        type="text"
                        value={pageNumFormat}
                        onChange={(e) => setPageNumFormat(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedTool.id === 'protect' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold">PDF Encryption Password:</label>
                    <input
                      type="password"
                      placeholder="Enter secret password..."
                      value={pdfPassword}
                      onChange={(e) => setPdfPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}

                {selectedTool.id === 'sign' && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">Draw E-Signature below:</label>
                    <div className="border border-slate-700 rounded-xl bg-white overflow-hidden relative">
                      <canvas
                        ref={canvasRef}
                        width={300}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full h-24 cursor-crosshair"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={clearSignature}
                        className="text-[11px] text-red-400 hover:underline font-semibold"
                      >
                        Clear Canvas
                      </button>
                      {signatureData && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Signature Attached
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {['merge', 'compress', 'img2pdf', 'pdf2jpg', 'pdf2word', 'pdf2txt'].includes(selectedTool.id) && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
                    <Zap className="w-4 h-4 text-indigo-400 inline mr-1" />
                    Default high-speed client-side presets applied automatically for maximum performance.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Preview Output for PDF to Text */}
          {extractedTextPreview && (
            <div className="bg-[#080c14] border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400">Extracted Plain Text Preview:</h4>
              <textarea
                readOnly
                value={extractedTextPreview}
                className="w-full h-36 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>
          )}

          {/* Big Execution Download Button */}
          <div>
            <button
              onClick={handleExecuteTool}
              disabled={isProcessing || (!selectedTool.noUpload && files.length === 0)}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-extrabold shadow-2xl shadow-indigo-600/30 disabled:opacity-50 transition-all active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing {selectedTool.name}...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Execute {selectedTool.name} & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Tools Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => handleSelectTool(tool)}
                className="group relative bg-[#0f172a] hover:bg-[#151f38] border border-slate-800/90 hover:border-indigo-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 group-hover:bg-indigo-600 border border-indigo-500/20 group-hover:border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 text-slate-300 group-hover:text-indigo-300 border border-slate-700 group-hover:border-indigo-500/30 transition-all">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
