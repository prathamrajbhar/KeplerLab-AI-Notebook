import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    // Notebook state
    const [currentNotebook, setCurrentNotebook] = useState(null);
    const [draftMode, setDraftMode] = useState(false);

    // Current material state
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [materials, setMaterials] = useState([]);

    // Chat state
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);

    // Generated content
    const [flashcards, setFlashcards] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [notes, setNotes] = useState([]);

    // UI state
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);
    const [activePanel, setActivePanel] = useState('chat');

    // Set loading state for a specific key
    const setLoadingState = useCallback((key, value) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    }, []);

    // Add a message to chat
    const addMessage = useCallback((role, content) => {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, message]);
        return message;
    }, []);

    // Clear chat
    const clearMessages = useCallback(() => {
        setMessages([]);
        setSessionId(null);
    }, []);

    // Add material
    const addMaterial = useCallback((material) => {
        setMaterials(prev => [...prev, material]);
        if (!currentMaterial) {
            setCurrentMaterial(material);
        }
    }, [currentMaterial]);

    // Add note
    const addNote = useCallback((content, source = null) => {
        const note = {
            id: Date.now(),
            content,
            source,
            timestamp: new Date(),
        };
        setNotes(prev => [...prev, note]);
        return note;
    }, []);

    const value = {
        // Notebook
        currentNotebook,
        setCurrentNotebook,
        draftMode,
        setDraftMode,

        // Material
        currentMaterial,
        setCurrentMaterial,
        materials,
        setMaterials,
        addMaterial,

        // Chat
        sessionId,
        setSessionId,
        messages,
        setMessages,
        addMessage,
        clearMessages,

        // Generated content
        flashcards,
        setFlashcards,
        quiz,
        setQuiz,
        notes,
        setNotes,
        addNote,

        // UI
        loading,
        setLoadingState,
        error,
        setError,
        activePanel,
        setActivePanel,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
