import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message }) {
    const isUser = message.role === 'user';

    return (
        <div className={`message mb-4 ${isUser ? 'message-user' : 'message-ai'}`}>
            <div className={`message-avatar ${isUser ? 'bg-accent/20' : 'bg-accent'}`}>
                {isUser ? (
                    <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                )}
            </div>
            <div className="message-content">
                <div className="message-bubble">
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ children }) => <h1 className="text-lg font-semibold text-text-primary mt-4 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-semibold text-text-primary mt-3 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold text-text-primary mt-2 mb-1">{children}</h3>,
                                    p: ({ children }) => <p className="text-text-primary mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-text-primary">{children}</li>,
                                    code: ({ inline, children }) => inline ? (
                                        <code className="px-1.5 py-0.5 rounded bg-dark-300 text-accent-light text-xs font-mono">{children}</code>
                                    ) : (
                                        <code className="block p-3 rounded-lg bg-dark-300 text-text-primary text-xs font-mono overflow-x-auto my-2">{children}</code>
                                    ),
                                    pre: ({ children }) => <pre className="bg-dark-300 rounded-lg overflow-x-auto my-2">{children}</pre>,
                                    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-3 my-2 text-text-secondary italic">{children}</blockquote>,
                                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">{children}</a>,
                                    table: ({ children }) => <table className="w-full my-2 border-collapse">{children}</table>,
                                    th: ({ children }) => <th className="border border-border px-3 py-2 text-left text-xs font-medium text-text-primary bg-dark-300">{children}</th>,
                                    td: ({ children }) => <td className="border border-border px-3 py-2 text-xs text-text-secondary">{children}</td>,
                                    strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                {message.citations && message.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {message.citations.map((citation, idx) => (
                            <span key={idx} className="citation">
                                <span className="citation-number">{idx + 1}</span>
                                <span className="truncate max-w-[100px]">{citation.source || 'Source'}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
