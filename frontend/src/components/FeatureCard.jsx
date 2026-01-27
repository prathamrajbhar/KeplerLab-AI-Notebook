export default function FeatureCard({ icon, title, description, onClick, loading, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className="feature-card w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="feature-card-icon">
                {loading ? (
                    <div className="loading-spinner w-5 h-5" />
                ) : (
                    icon
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary">{title}</h4>
                <p className="text-xs text-text-muted truncate">{description}</p>
            </div>
            <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}
