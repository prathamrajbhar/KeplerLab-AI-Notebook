import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendChatMessage, getChatHistory } from '../api/chat';
import ChatMessage from './ChatMessage';

const QUICK_ACTIONS = [
    { id: 'summarize', label: 'Summarize', icon: '📝' },
    { id: 'explain', label: 'Explain this', icon: '💡' },
    { id: 'keypoints', label: 'Key points', icon: '🎯' },
    { id: 'studyguide', label: 'Study guide', icon: '📚' },
];

export default function ChatPanel() {
    const {
        currentMaterial,
        currentNotebook,
        messages,
        setMessages,
        addMessage,
        loading,
        setLoadingState,
        draftMode
    } = useApp();

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (currentNotebook?.id && !currentNotebook.isDraft && !draftMode) {
                try {
                    const history = await getChatHistory(currentNotebook.id);
                    if (history && history.length > 0) {
                        const loadedMessages = history.map(msg => ({
                            id: msg.id,
                            role: msg.role,
                            content: msg.content,
                            timestamp: new Date(msg.created_at),
                        }));
                        setMessages(loadedMessages);
                    }
                } catch (error) {
                    console.error('Failed to load chat history:', error);
                }
            }
        };
        loadHistory();
    }, [currentNotebook?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    const handleSend = async (message = inputValue) => {
        if (!message.trim() || !currentMaterial || !currentNotebook?.id || currentNotebook.isDraft) return;

        const userMessage = message.trim();
        setInputValue('');
        addMessage('user', userMessage);
        setLoadingState('chat', true);

        try {
            const response = await sendChatMessage(currentMaterial.id, userMessage, currentNotebook.id);
            addMessage('assistant', response.answer, response.citations);
        } catch (error) {
            addMessage('assistant', `I encountered an error: ${error.message}`);
        } finally {
            setLoadingState('chat', false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (action) => {
        const prompts = {
            summarize: 'Summarize the main points from this document',
            explain: 'Explain the key concepts in simple terms',
            keypoints: 'What are the most important takeaways?',
            studyguide: 'Create a study guide from this content',
        };
        handleSend(prompts[action.id] || action.label);
    };

    return (
        <main className="flex-1 bg-dark-50 flex flex-col overflow-hidden">
            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                        <div className="max-w-lg text-center">
                            {currentMaterial ? (
                                <>
                                    {/* Active source indicator */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full mb-6">
                                        <div className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
                                        <span className="text-sm text-text-secondary">
                                            Ready to explore <span className="text-text-primary font-medium">{currentMaterial.filename}</span>
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-semibold text-text-primary mb-3">
                                        What would you like to know?
                                    </h2>
                                    <p className="text-text-secondary mb-8">
                                        Ask questions and I'll answer based on your source. All responses include citations.
                                    </p>

                                    {/* Quick Actions */}
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {QUICK_ACTIONS.map((action) => (
                                            <button
                                                key={action.id}
                                                className="quick-action-chip"
                                                onClick={() => handleQuickAction(action)}
                                            >
                                                <span>{action.icon}</span>
                                                <span>{action.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-text-primary mb-3">
                                        Welcome to KeplerLab
                                    </h2>
                                    <p className="text-text-secondary">
                                        Add sources to start exploring with AI-powered research assistance
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}

                        {loading.chat && (
                            <div className="message mb-4 animate-fade-in">
                                <div className="message-avatar bg-accent">
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                                <div className="message-content">
                                    <div className="message-bubble glass inline-block">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-dark-100">
                <div className="max-w-3xl mx-auto">
                    <div className="chat-input-container">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={currentMaterial ? "Ask about your sources..." : "Select a source to start..."}
                            disabled={!currentMaterial || loading.chat}
                            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none outline-none min-h-[24px] max-h-[120px] py-1"
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!inputValue.trim() || !currentMaterial || loading.chat}
                            className="btn-icon-sm bg-accent text-white disabled:opacity-30 disabled:bg-dark-300 disabled:text-text-muted shadow-glow-sm disabled:shadow-none transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-center text-xs text-text-muted mt-2">
                        Responses are grounded in your sources with inline citations
                    </p>
                </div>
            </div>
        </main>
    );
}
