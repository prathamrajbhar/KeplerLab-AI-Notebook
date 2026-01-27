import { useState, useEffect } from 'react';
import { getNotebooks, createNotebook, deleteNotebook, updateNotebook } from '../api/notebooks';

export default function NotebookSelector({ currentNotebook, onSelectNotebook }) {
    const [notebooks, setNotebooks] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renamingNotebook, setRenamingNotebook] = useState(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        loadNotebooks();
    }, []);

    const loadNotebooks = async () => {
        try {
            const data = await getNotebooks();
            setNotebooks(data);
            if (!currentNotebook && data.length > 0) {
                onSelectNotebook(data[0]);
            }
        } catch (err) {
            console.error('Failed to load notebooks:', err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setLoading(true);
        try {
            const notebook = await createNotebook(newName.trim(), newDescription.trim() || null);
            setNotebooks([notebook, ...notebooks]);
            onSelectNotebook(notebook);
            setShowCreateModal(false);
            setNewName('');
            setNewDescription('');
        } catch (err) {
            console.error('Failed to create notebook:', err);
        }
        setLoading(false);
    };

    const handleRename = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !renamingNotebook) return;

        setLoading(true);
        try {
            const updated = await updateNotebook(renamingNotebook.id, newName.trim(), newDescription.trim() || null);
            setNotebooks(notebooks.map(n => n.id === renamingNotebook.id ? updated : n));
            if (currentNotebook?.id === renamingNotebook.id) {
                onSelectNotebook(updated);
            }
            setShowRenameModal(false);
            setRenamingNotebook(null);
            setNewName('');
            setNewDescription('');
        } catch (err) {
            console.error('Failed to rename notebook:', err);
        }
        setLoading(false);
    };

    const openRenameModal = (notebook, e) => {
        e.stopPropagation();
        setActiveMenu(null);
        setRenamingNotebook(notebook);
        setNewName(notebook.name);
        setNewDescription(notebook.description || '');
        setShowRenameModal(true);
        setShowDropdown(false);
    };

    const handleDelete = async (notebookId, e) => {
        e.stopPropagation();
        setActiveMenu(null);
        if (!confirm('Delete this notebook and all its materials?')) return;

        try {
            await deleteNotebook(notebookId);
            const updated = notebooks.filter(n => n.id !== notebookId);
            setNotebooks(updated);
            if (currentNotebook?.id === notebookId) {
                onSelectNotebook(updated[0] || null);
            }
        } catch (err) {
            console.error('Failed to delete notebook:', err);
        }
    };

    return (
        <div className="relative">
            {/* Notebook Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-glass-light text-text-primary text-sm transition-colors"
            >
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="max-w-[150px] truncate">{currentNotebook?.name || 'Select Notebook'}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => { setShowDropdown(false); setActiveMenu(null); }} />
                    <div className="absolute left-0 top-full mt-2 w-72 glass-strong rounded-xl shadow-glass z-50 overflow-hidden animate-fade-in">
                        {/* Create New */}
                        <button
                            onClick={() => { setShowCreateModal(true); setShowDropdown(false); }}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-accent-light hover:bg-glass-light transition-colors border-b border-border"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Notebook
                        </button>

                        {/* Notebook List */}
                        <div className="max-h-72 overflow-y-auto">
                            {notebooks.length === 0 ? (
                                <div className="px-4 py-6 text-center text-text-muted text-sm">
                                    No notebooks yet
                                </div>
                            ) : (
                                notebooks.map(notebook => (
                                    <div
                                        key={notebook.id}
                                        className={`relative group ${currentNotebook?.id === notebook.id ? 'bg-accent/10' : ''}`}
                                    >
                                        <div
                                            onClick={() => { onSelectNotebook(notebook); setShowDropdown(false); }}
                                            className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-glass-light transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${currentNotebook?.id === notebook.id ? 'bg-accent/30' : 'bg-accent/15'}`}>
                                                    <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-text-primary truncate">{notebook.name}</p>
                                                    {notebook.description && (
                                                        <p className="text-xs text-text-muted truncate">{notebook.description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 3-dot menu button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === notebook.id ? null : notebook.id); }}
                                                className="p-1 rounded-lg hover:bg-dark-300 text-text-muted opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Actions submenu */}
                                        {activeMenu === notebook.id && (
                                            <div className="absolute right-2 top-full mt-1 w-32 glass-strong rounded-lg shadow-glass overflow-hidden z-50">
                                                <button
                                                    onClick={(e) => openRenameModal(notebook, e)}
                                                    className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-glass-light flex items-center gap-2 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(notebook.id, e)}
                                                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="modal w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-base font-medium text-text-primary">Create New Notebook</h3>
                            <button onClick={() => setShowCreateModal(false)} className="btn-icon-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="modal-body space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Machine Learning Notes"
                                    className="input w-full"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Brief description..."
                                    rows={2}
                                    className="input w-full resize-none"
                                />
                            </div>
                        </form>
                        <div className="modal-footer">
                            <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleCreate} disabled={loading || !newName.trim()} className="btn-primary">
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {showRenameModal && renamingNotebook && (
                <div className="modal-backdrop" onClick={() => { setShowRenameModal(false); setRenamingNotebook(null); }}>
                    <div className="modal w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-base font-medium text-text-primary">Rename Notebook</h3>
                            <button onClick={() => { setShowRenameModal(false); setRenamingNotebook(null); }} className="btn-icon-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleRename} className="modal-body space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Notebook name"
                                    className="input w-full"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Brief description..."
                                    rows={2}
                                    className="input w-full resize-none"
                                />
                            </div>
                        </form>
                        <div className="modal-footer">
                            <button onClick={() => { setShowRenameModal(false); setRenamingNotebook(null); }} className="btn-secondary">Cancel</button>
                            <button onClick={handleRename} disabled={loading || !newName.trim()} className="btn-primary">
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
