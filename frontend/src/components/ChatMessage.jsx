import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

// Custom code theme with enhanced styling
const customCodeTheme = {
    ...oneDark,
    'pre[class*="language-"]': {
        ...oneDark['pre[class*="language-"]'],
        background: 'linear-gradient(135deg, #1e1e2e 0%, #252536 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        margin: '16px 0',
        padding: '16px',
        fontSize: '13px',
    },
};

function CopyButton({ code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="copy-code-btn"
            title="Copy code"
        >
            {copied ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    );
}

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
                        <div className="markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Headings with gradient accents
                                    h1: ({ children }) => (
                                        <h1 className="md-heading md-h1">
                                            <span className="md-heading-icon">📌</span>
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="md-heading md-h2">
                                            <span className="md-heading-icon">✨</span>
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="md-heading md-h3">{children}</h3>
                                    ),
                                    h4: ({ children }) => (
                                        <h4 className="md-heading md-h4">{children}</h4>
                                    ),

                                    // Enhanced paragraphs
                                    p: ({ children }) => (
                                        <p className="md-paragraph">{children}</p>
                                    ),

                                    // Beautiful lists
                                    ul: ({ children }) => (
                                        <ul className="md-list md-ul">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="md-list md-ol">{children}</ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="md-list-item">{children}</li>
                                    ),

                                    // Syntax highlighted code blocks
                                    code: ({ inline, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeString = String(children).replace(/\n$/, '');

                                        if (!inline && (match || codeString.includes('\n'))) {
                                            const language = match ? match[1] : 'text';
                                            return (
                                                <div className="md-code-block-wrapper">
                                                    <div className="md-code-header">
                                                        <span className="md-code-language">{language}</span>
                                                        <CopyButton code={codeString} />
                                                    </div>
                                                    <SyntaxHighlighter
                                                        style={customCodeTheme}
                                                        language={language}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            borderRadius: '0 0 12px 12px',
                                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                                            borderTop: 'none',
                                                        }}
                                                        {...props}
                                                    >
                                                        {codeString}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }
                                        return (
                                            <code className="md-inline-code" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    pre: ({ children }) => <>{children}</>,

                                    // Styled blockquote
                                    blockquote: ({ children }) => (
                                        <blockquote className="md-blockquote">
                                            <div className="md-blockquote-icon">💡</div>
                                            <div className="md-blockquote-content">{children}</div>
                                        </blockquote>
                                    ),

                                    // Links with hover effect
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="md-link"
                                        >
                                            {children}
                                            <svg className="w-3 h-3 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ),

                                    // Beautiful tables
                                    table: ({ children }) => (
                                        <div className="md-table-wrapper">
                                            <table className="md-table">{children}</table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="md-thead">{children}</thead>
                                    ),
                                    tbody: ({ children }) => (
                                        <tbody className="md-tbody">{children}</tbody>
                                    ),
                                    tr: ({ children }) => (
                                        <tr className="md-tr">{children}</tr>
                                    ),
                                    th: ({ children }) => (
                                        <th className="md-th">{children}</th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="md-td">{children}</td>
                                    ),

                                    // Text formatting
                                    strong: ({ children }) => (
                                        <strong className="md-strong">{children}</strong>
                                    ),
                                    em: ({ children }) => (
                                        <em className="md-em">{children}</em>
                                    ),
                                    del: ({ children }) => (
                                        <del className="md-del">{children}</del>
                                    ),

                                    // Horizontal rule
                                    hr: () => <hr className="md-hr" />,

                                    // Images
                                    img: ({ src, alt }) => (
                                        <div className="md-image-wrapper">
                                            <img src={src} alt={alt} className="md-image" />
                                            {alt && <span className="md-image-caption">{alt}</span>}
                                        </div>
                                    ),
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
