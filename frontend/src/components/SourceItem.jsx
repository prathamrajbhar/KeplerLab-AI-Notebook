export default function SourceItem({ source, selected, active, onSelect, onSeeText }) {
    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') {
            return (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    return (
        <div
            onClick={() => onSelect(source)}
            className={`source-item group ${active ? 'active' : ''}`}
        >
            <div className={`source-icon ${active ? 'bg-accent/10 text-accent-light' : 'text-text-muted'}`}>
                {getFileIcon(source.filename)}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${active ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                    {source.filename}
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSeeText(source);
                    }}
                    title="View text"
                    className="p-1 rounded text-text-muted hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>
            {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
        </div>
    );
}
