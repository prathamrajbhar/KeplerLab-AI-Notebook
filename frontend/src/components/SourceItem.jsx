export default function SourceItem({ source, selected, active, onSelect }) {
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
            className={`source-item ${active ? 'active' : ''}`}
        >
            <div className={`source-icon ${active ? 'bg-accent/10 text-accent-light' : 'text-text-muted'}`}>
                {getFileIcon(source.filename)}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${active ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                    {source.filename}
                </p>
                {source.chunkCount && (
                    <p className="text-xs text-text-muted">{source.chunkCount} chunks</p>
                )}
            </div>
            {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
        </div>
    );
}
