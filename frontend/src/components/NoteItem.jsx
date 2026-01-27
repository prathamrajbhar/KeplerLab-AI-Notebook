export default function NoteItem({ note, onClick, onDelete }) {
    const formatTime = (date) => {
        const now = new Date();
        const noteDate = new Date(date);
        const diffMs = now - noteDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div
            className="note-item group"
            onClick={() => onClick?.(note)}
        >
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-dark-text-primary truncate font-medium">
                    {note.content}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    {note.source && (
                        <>
                            <span className="text-xs text-accent-blue truncate max-w-[100px]">{note.source}</span>
                            <span className="text-dark-text-muted">•</span>
                        </>
                    )}
                    <span className="text-xs text-dark-text-muted">{formatTime(note.timestamp)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    className="btn-icon-sm text-dark-text-muted hover:text-dark-text-primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                    }}
                    title="Edit note"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                {onDelete && (
                    <button
                        className="btn-icon-sm text-dark-text-muted hover:text-accent-red"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(note);
                        }}
                        title="Delete note"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
