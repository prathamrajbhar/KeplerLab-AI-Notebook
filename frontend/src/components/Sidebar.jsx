import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { uploadMaterial, uploadMaterialWithAutoNotebook, getMaterials } from '../api/materials';
import SourceItem from './SourceItem';

export default function Sidebar() {
    const {
        materials,
        setMaterials,
        currentMaterial,
        setCurrentMaterial,
        addMaterial,
        setLoadingState,
        loading,
        currentNotebook,
        setCurrentNotebook,
        draftMode,
        setDraftMode
    } = useApp();
    const [selectedSources, setSelectedSources] = useState(new Set());
    const [dragActive, setDragActive] = useState(false);
    const [width, setWidth] = useState(280);
    const [isResizing, setIsResizing] = useState(false);
    const fileInputRef = useRef(null);

    const minWidth = 200;
    const maxWidth = 500;

    useEffect(() => {
        const loadMaterials = async () => {
            if (currentNotebook?.id && !currentNotebook.isDraft && !draftMode) {
                try {
                    const loadedMaterials = await getMaterials(currentNotebook.id);
                    const formatted = loadedMaterials.map(m => ({
                        id: m.id,
                        filename: m.filename,
                        status: m.status,
                        chunkCount: m.chunk_count,
                    }));
                    setMaterials(formatted);
                    if (formatted.length > 0 && !currentMaterial) {
                        setCurrentMaterial(formatted[0]);
                    }
                } catch (error) {
                    console.error('Failed to load materials:', error);
                }
            }
        };
        loadMaterials();
    }, [currentNotebook?.id]);

    const handleMouseMove = useCallback((e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidth(newWidth);
            }
        }
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        setLoadingState('upload', true);

        try {
            for (const file of files) {
                let result;

                if (draftMode && currentNotebook?.isDraft) {
                    result = await uploadMaterialWithAutoNotebook(file);

                    if (result.notebook) {
                        setCurrentNotebook(result.notebook);
                        setDraftMode(false);
                    }
                } else {
                    result = await uploadMaterial(file, currentNotebook?.id);
                }

                addMaterial({
                    id: result.material_id,
                    filename: result.filename,
                    chunkCount: result.chunk_count,
                    status: result.status,
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setLoadingState('upload', false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(Array.from(e.dataTransfer.files));
        }
    };

    const toggleSourceSelection = (source) => {
        const newSelected = new Set(selectedSources);
        if (newSelected.has(source.id)) {
            newSelected.delete(source.id);
        } else {
            newSelected.add(source.id);
        }
        setSelectedSources(newSelected);
        setCurrentMaterial(source);
    };

    return (
        <aside
            className="glass-light h-full overflow-hidden flex flex-col relative border-r border-border"
            style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
        >
            {/* Header */}
            <div className="panel-header">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="panel-title">Sources</span>
                    {materials.length > 0 && (
                        <span className="badge-accent">{materials.length}</span>
                    )}
                </div>
            </div>

            {/* Add Source Button */}
            <div className="p-3 border-b border-border">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    multiple
                    onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                />
                <button
                    className="w-full btn-secondary justify-center"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading.upload}
                >
                    {loading.upload ? (
                        <div className="loading-spinner w-4 h-4" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                    Add source
                </button>
            </div>

            {/* Sources List */}
            <div
                className={`flex-1 overflow-y-auto transition-colors ${dragActive ? 'bg-accent/5' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {materials.length > 0 ? (
                    <div className="p-2">
                        <div className="space-y-0.5">
                            {materials.map((source) => (
                                <SourceItem
                                    key={source.id}
                                    source={source}
                                    selected={selectedSources.has(source.id)}
                                    active={currentMaterial?.id === source.id}
                                    onSelect={toggleSourceSelection}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full p-4">
                        <div className={`dropzone h-full ${dragActive ? 'dropzone-active' : ''}`}>
                            <div className="empty-state-icon">
                                <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="empty-state-title">Add sources</p>
                            <p className="empty-state-description mt-1">
                                Upload PDFs, docs, or text files to get started
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Resize Handle */}
            <div
                className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize transition-colors group ${isResizing ? 'bg-accent/50' : 'hover:bg-accent/30'}`}
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </aside>
    );
}
