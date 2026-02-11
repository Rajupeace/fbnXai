import React, { useRef, useState, useEffect } from 'react';
import { FaPencilAlt, FaEraser, FaTrash, FaSave, FaUndo, FaRedo, FaPaintBrush, FaHighlighter, FaFileUpload, FaImage, FaChevronLeft, FaChevronRight, FaPlus, FaEye } from 'react-icons/fa';
import './Whiteboard.css';

const Whiteboard = ({ onSave, onPreview, historyCount = 0, initialData, isReadOnly = false }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [tool, setTool] = useState('pencil');
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUploadHelp, setShowUploadHelp] = useState(false);
    const [boardNumber, setBoardNumber] = useState(1);

    // Expanded professional color palette
    const colorPalette = [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Amber', value: '#f59e0b' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Lime', value: '#84cc16' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Emerald', value: '#10b981' },
        { name: 'Teal', value: '#14b8a6' },
        { name: 'Cyan', value: '#06b6d4' },
        { name: 'Sky', value: '#0ea5e9' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Violet', value: '#8b5cf6' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Fuchsia', value: '#d946ef' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Rose', value: '#f43f5e' },
        { name: 'Gray', value: '#6b7280' }
    ];

    const brushSizes = [
        { label: 'Thin', value: 2 },
        { label: 'Normal', value: 4 },
        { label: 'Medium', value: 8 },
        { label: 'Thick', value: 12 },
        { label: 'Bold', value: 16 }
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        redrawCanvas();

        if (initialData) {
            const img = new Image();
            img.onload = () => {
                context.drawImage(img, 0, 0, rect.width, rect.height);
                saveToHistory();
            };
            img.src = initialData;
        } else {
            saveToHistory();
        }
    }, [initialData, backgroundImage]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        const rect = canvas.getBoundingClientRect();

        // Fill with white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw background image if exists
        if (backgroundImage) {
            const img = new Image();
            img.onload = () => {
                context.drawImage(img, 0, 0, rect.width, rect.height);
            };
            img.src = backgroundImage;
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileType = file.type;

        // Handle images directly
        if (fileType.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBackgroundImage(event.target.result);
                setUploadedFile(file.name);
                setTimeout(() => {
                    redrawCanvas();
                    saveToHistory();
                }, 100);
            };
            reader.readAsDataURL(file);
        }
        // Handle PDF files - render first page automatically
        else if (fileType === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    if (typeof window.pdfjsLib === 'undefined') {
                        alert('PDF library not loaded. Please refresh the page.');
                        return;
                    }

                    const pdfData = new Uint8Array(event.target.result);
                    const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
                    const pdf = await loadingTask.promise;
                    const page = await pdf.getPage(1);

                    // Render at 2x scale for better quality
                    const viewport = page.getViewport({ scale: 2.0 });
                    const tempCanvas = document.createElement('canvas');
                    const tempContext = tempCanvas.getContext('2d');
                    tempCanvas.width = viewport.width;
                    tempCanvas.height = viewport.height;

                    await page.render({
                        canvasContext: tempContext,
                        viewport: viewport
                    }).promise;

                    // Convert to image
                    const imageData = tempCanvas.toDataURL('image/png');
                    setBackgroundImage(imageData);
                    setUploadedFile(file.name + ' (Page 1)');
                    setTotalPages(pdf.numPages);

                    setTimeout(() => {
                        redrawCanvas();
                        saveToHistory();
                    }, 100);
                } catch (error) {
                    console.error('PDF rendering error:', error);
                    alert('Failed to load PDF. Please try converting to an image first.');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };
            reader.readAsArrayBuffer(file);
        }
        // For PPT files, show help modal
        else if (file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
            setShowUploadHelp(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setShowUploadHelp(true);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL();
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(dataUrl);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            restoreFromHistory(history[newStep]);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            restoreFromHistory(history[newStep]);
        }
    };

    const restoreFromHistory = (dataUrl) => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        const rect = canvas.getBoundingClientRect();
        const img = new Image();
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = dataUrl;
    };

    const startDrawing = ({ nativeEvent }) => {
        if (isReadOnly) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || isReadOnly) return;
        const { offsetX, offsetY } = nativeEvent;

        if (tool === 'eraser') {
            contextRef.current.strokeStyle = '#ffffff';
            contextRef.current.lineWidth = lineWidth * 2;
        } else if (tool === 'highlighter') {
            contextRef.current.strokeStyle = color;
            contextRef.current.globalAlpha = 0.3;
            contextRef.current.lineWidth = lineWidth * 3;
        } else {
            contextRef.current.strokeStyle = color;
            contextRef.current.globalAlpha = 1;
            contextRef.current.lineWidth = lineWidth;
        }

        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        contextRef.current.closePath();
        contextRef.current.globalAlpha = 1;
        setIsDrawing(false);
        saveToHistory();
    };

    const clearCanvas = () => {
        if (isReadOnly) return;
        if (!window.confirm('Clear entire board? This cannot be undone.')) return;
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        saveToHistory();
    };

    const createNewBoard = () => {
        if (isReadOnly) return;
        const canvas = canvasRef.current;
        const context = contextRef.current;

        // Clear canvas
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.beginPath();

        // Reset background
        setBackgroundImage(null);
        setUploadedFile(null);

        // Reset history for new board
        setHistory([]);
        setHistoryStep(-1);
        saveToHistory();

        // Increment board number
        setBoardNumber(prev => prev + 1);
    };

    const handleSave = () => {
        if (onSave) {
            const canvas = canvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="whiteboard-container">
            {!isReadOnly && (
                <div className="whiteboard-toolbar">
                    {/* Document Upload */}
                    <div className="toolbar-section">
                        <div className="section-label">DOCUMENT</div>
                        <div className="toolbar-group upload-section">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*,.pdf"
                                style={{ display: 'none' }}
                            />
                            <button
                                className="tool-btn upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Upload Slide/Image"
                            >
                                <FaFileUpload />
                            </button>
                            {uploadedFile && (
                                <div className="background-info">
                                    <FaImage />
                                    <span>{uploadedFile}</span>
                                    <button
                                        className="clear-bg-btn"
                                        onClick={() => {
                                            setBackgroundImage(null);
                                            setUploadedFile(null);
                                            redrawCanvas();
                                            saveToHistory();
                                        }}
                                        title="Clear Background"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tool Selection */}
                    <div className="toolbar-section">
                        <div className="section-label">TOOLS</div>
                        <div className="toolbar-group tools">
                            <button
                                className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
                                onClick={() => setTool('pencil')}
                                title="Pencil"
                            >
                                <FaPencilAlt />
                            </button>
                            <button
                                className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                                onClick={() => setTool('brush')}
                                title="Brush"
                            >
                                <FaPaintBrush />
                            </button>
                            <button
                                className={`tool-btn ${tool === 'highlighter' ? 'active' : ''}`}
                                onClick={() => setTool('highlighter')}
                                title="Highlighter"
                            >
                                <FaHighlighter />
                            </button>
                            <button
                                className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                                onClick={() => setTool('eraser')}
                                title="Eraser"
                            >
                                <FaEraser />
                            </button>
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div className="toolbar-section">
                        <div className="section-label">COLORS</div>
                        <div className="toolbar-group colors-grid">
                            {colorPalette.map(c => (
                                <button
                                    key={c.value}
                                    className={`color-btn ${color === c.value && tool !== 'eraser' ? 'selected' : ''}`}
                                    style={{ backgroundColor: c.value, border: c.value === '#FFFFFF' ? '2px solid #e2e8f0' : 'none' }}
                                    onClick={() => {
                                        setColor(c.value);
                                        if (tool === 'eraser') setTool('pencil');
                                    }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Brush Size */}
                    <div className="toolbar-section">
                        <div className="section-label">SIZE</div>
                        <div className="toolbar-group size-buttons">
                            {brushSizes.map(size => (
                                <button
                                    key={size.value}
                                    className={`size-btn ${lineWidth === size.value ? 'active' : ''}`}
                                    onClick={() => setLineWidth(size.value)}
                                >
                                    <div className="size-preview" style={{
                                        width: `${size.value + 4}px`,
                                        height: `${size.value + 4}px`,
                                        backgroundColor: tool === 'eraser' ? '#cbd5e1' : color
                                    }}></div>
                                    <span>{size.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="toolbar-section">
                        <div className="section-label">ACTIONS</div>
                        <div className="toolbar-group actions">
                            <button
                                className="action-btn undo"
                                onClick={undo}
                                disabled={historyStep <= 0}
                                title="Undo"
                            >
                                <FaUndo />
                            </button>
                            <button
                                className="action-btn redo"
                                onClick={redo}
                                disabled={historyStep >= history.length - 1}
                                title="Redo"
                            >
                                <FaRedo />
                            </button>
                            <button className="action-btn clear" onClick={clearCanvas} title="Clear All">
                                <FaTrash />
                            </button>
                            <button className="action-btn new-board" onClick={createNewBoard} title="Start New Board">
                                <FaPlus /> NEW
                            </button>
                            <button className="action-btn preview" onClick={onPreview} title="Preview Saved Boards">
                                <FaEye /> PREVIEW ({historyCount})
                            </button>
                            <button className="action-btn save primary" onClick={handleSave} title="Save to Dashboard">
                                <FaSave /> SAVE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`canvas-wrapper ${isReadOnly ? 'read-only' : ''}`}>
                <canvas
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    ref={canvasRef}
                />
                {!isReadOnly && (
                    <div className="canvas-status">
                        <span className="current-tool">
                            {tool === 'pencil' && <FaPencilAlt />}
                            {tool === 'brush' && <FaPaintBrush />}
                            {tool === 'highlighter' && <FaHighlighter />}
                            {tool === 'eraser' && <FaEraser />}
                            {tool.charAt(0).toUpperCase() + tool.slice(1)} • {lineWidth}px
                        </span>
                    </div>
                )}
            </div>

            {/* Upload Help Modal */}
            {showUploadHelp && (
                <div
                    className="upload-help-overlay"
                    onClick={() => setShowUploadHelp(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.95)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        backdropFilter: 'blur(10px)',
                        animation: 'fadeIn 0.3s'
                    }}
                >
                    <div
                        className="upload-help-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            maxWidth: '600px',
                            width: '100%',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            animation: 'slideUp 0.3s'
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '2.5rem',
                                color: 'white'
                            }}>
                                <FaFileUpload />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                                Document Upload Guide
                            </h2>
                            <p style={{ color: '#64748b', fontSize: '1rem' }}>
                                Upload your presentation materials
                            </p>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaImage style={{ color: '#10b981' }} />
                                Supported Formats
                            </h3>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {['JPG', 'PNG', 'GIF', 'BMP', 'WebP', 'PDF'].map(format => (
                                    <span key={format} style={{
                                        background: format === 'PDF' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700
                                    }}>
                                        {format}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '2px solid #10b981' }}>
                            <p style={{ margin: 0, color: '#065f46', fontSize: '0.9rem', fontWeight: 600 }}>
                                ✅ <strong>PDF Files:</strong> Automatically rendered! Just upload and annotate.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                                📊 PowerPoint Files (PPT/PPTX):
                            </h3>
                            <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
                                <li><strong>Method 1:</strong> File → Export → PNG/JPG</li>
                                <li><strong>Method 2:</strong> Use online tools like SmallPDF.com</li>
                                <li><strong>Quick Method:</strong> Take screenshots of each slide</li>
                            </ol>
                        </div>

                        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', border: '2px solid #3b82f6' }}>
                            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem', fontWeight: 600 }}>
                                💡 <strong>Pro Tip:</strong> Use 1920x1080 resolution for best quality!
                            </p>
                        </div>

                        <button
                            onClick={() => setShowUploadHelp(false)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            GOT IT!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Whiteboard;
