import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateFlashcards, generateQuiz, generateSlides, downloadSlides, generatePodcast, downloadPodcast, generateExplainer, downloadExplainer, downloadBlob } from '../api/generation';
import { saveGeneratedContent, getGeneratedContent } from '../api/notebooks';
import FeatureCard from './FeatureCard';
import { jsPDF } from 'jspdf';

const AudioIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const FlashcardsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const QuizIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const SlidesIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const VideoIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const BackIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

export default function StudioPanel() {
    const { currentMaterial, currentNotebook, draftMode, setFlashcards, setQuiz, loading, setLoadingState } = useApp();

    // View state: null = grid view, 'audio' | 'flashcards' | 'quiz' | 'slides' | 'video' = inline view
    const [activeView, setActiveView] = useState(null);

    const [flashcardsData, setFlashcardsData] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [slidesData, setSlidesData] = useState(null);
    const [videoData, setVideoData] = useState(null);
    const [audioData, setAudioData] = useState(null);
    const [width, setWidth] = useState(360);
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef(null);

    const minWidth = 260;
    const maxWidth = 600;

    useEffect(() => {
        const loadSavedContent = async () => {
            if (currentNotebook?.id && !currentNotebook.isDraft && !draftMode) {
                try {
                    const contents = await getGeneratedContent(currentNotebook.id);
                    contents.forEach(c => {
                        switch (c.content_type) {
                            case 'flashcards':
                                setFlashcardsData(c.data);
                                setFlashcards(c.data);
                                break;
                            case 'quiz':
                                setQuizData(c.data);
                                setQuiz(c.data);
                                break;
                            case 'slides':
                                setSlidesData(c.data);
                                break;
                            case 'audio':
                                setAudioData(c.data);
                                break;
                            case 'video':
                                setVideoData(c.data);
                                break;
                        }
                    });
                } catch (error) {
                    console.error('Failed to load saved content:', error);
                }
            }
        };
        loadSavedContent();
    }, [currentNotebook?.id]);

    const handleMouseMove = useCallback((e) => {
        if (isResizing && panelRef.current) {
            const rect = panelRef.current.getBoundingClientRect();
            const newWidth = rect.right - e.clientX;
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

    const canSave = currentNotebook?.id && !currentNotebook.isDraft && !draftMode;

    const handleGenerateAudio = async () => {
        if (!currentMaterial) return;
        setLoadingState('audio', true);
        try {
            const data = await generatePodcast(currentMaterial.id);
            setAudioData(data);
            setActiveView('audio');
            if (canSave) {
                await saveGeneratedContent(currentNotebook.id, 'audio', data, data.title, currentMaterial.id);
            }
        } catch (error) {
            console.error('Failed to generate podcast:', error);
        } finally {
            setLoadingState('audio', false);
        }
    };

    const handleGenerateSlides = async () => {
        if (!currentMaterial) return;
        setLoadingState('slides', true);
        try {
            const data = await generateSlides(currentMaterial.id);
            setSlidesData(data);
            setActiveView('slides');
            if (canSave) {
                await saveGeneratedContent(currentNotebook.id, 'slides', data, data.chapter_title, currentMaterial.id);
            }
        } catch (error) {
            console.error('Failed to generate slides:', error);
        } finally {
            setLoadingState('slides', false);
        }
    };

    const handleGenerateExplainer = async () => {
        if (!currentMaterial) return;
        setLoadingState('explainer', true);
        try {
            const data = await generateExplainer(currentMaterial.id);
            setVideoData(data);
            setActiveView('video');
            if (canSave) {
                await saveGeneratedContent(currentNotebook.id, 'video', data, 'Video Explainer', currentMaterial.id);
            }
        } catch (error) {
            console.error('Failed to generate explainer video:', error);
        } finally {
            setLoadingState('explainer', false);
        }
    };

    const handleGenerateFlashcards = async () => {
        if (!currentMaterial) return;
        setLoadingState('flashcards', true);
        try {
            const data = await generateFlashcards(currentMaterial.id);
            setFlashcardsData(data);
            setFlashcards(data);
            setActiveView('flashcards');
            if (canSave) {
                await saveGeneratedContent(currentNotebook.id, 'flashcards', data, `${data.flashcards?.length || 0} Flashcards`, currentMaterial.id);
            }
        } catch (error) {
            console.error('Failed to generate flashcards:', error);
        } finally {
            setLoadingState('flashcards', false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!currentMaterial) return;
        setLoadingState('quiz', true);
        try {
            const data = await generateQuiz(currentMaterial.id);
            setQuizData(data);
            setQuiz(data);
            setActiveView('quiz');
            if (canSave) {
                await saveGeneratedContent(currentNotebook.id, 'quiz', data, `${data.questions?.length || 0} Questions`, currentMaterial.id);
            }
        } catch (error) {
            console.error('Failed to generate quiz:', error);
        } finally {
            setLoadingState('quiz', false);
        }
    };

    const outputs = [
        { id: 'audio', title: 'Audio Overview', description: 'Listen to a podcast-style summary', icon: <AudioIcon />, onClick: handleGenerateAudio },
        { id: 'flashcards', title: 'Flashcards', description: 'Study with spaced repetition', icon: <FlashcardsIcon />, onClick: handleGenerateFlashcards },
        { id: 'quiz', title: 'Practice Quiz', description: 'Test your understanding', icon: <QuizIcon />, onClick: handleGenerateQuiz },
        { id: 'slides', title: 'Slide Deck', description: 'Generate a presentation', icon: <SlidesIcon />, onClick: handleGenerateSlides },
        { id: 'explainer', title: 'Video Explainer', description: 'AI-generated teaching video', icon: <VideoIcon />, onClick: handleGenerateExplainer },
    ];

    const viewTitles = {
        audio: 'Audio Overview',
        flashcards: 'Flashcards',
        quiz: 'Quiz',
        slides: 'Slides',
        video: 'Video Overview'
    };

    const renderInlineContent = () => {
        switch (activeView) {
            case 'audio':
                return <InlineAudioView data={audioData} materialId={currentMaterial?.id} />;
            case 'flashcards':
                return <InlineFlashcardsView data={flashcardsData} />;
            case 'quiz':
                return <InlineQuizView data={quizData} />;
            case 'slides':
                return <InlineSlidesView data={slidesData} materialId={currentMaterial?.id} />;
            case 'video':
                return <InlineVideoView data={videoData} materialId={currentMaterial?.id} />;
            default:
                return null;
        }
    };

    return (
        <aside
            ref={panelRef}
            className="glass-light h-full overflow-hidden flex flex-col relative border-l border-border"
            style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
        >
            {/* Resize Handle */}
            <div
                className={`absolute top-0 left-0 w-1.5 h-full cursor-col-resize transition-colors z-10 group ${isResizing ? 'bg-accent/50' : 'hover:bg-accent/30'}`}
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Header with Breadcrumb */}
            <div className="panel-header">
                <div className="flex items-center gap-2">
                    {activeView ? (
                        <>
                            <button
                                onClick={() => setActiveView(null)}
                                className="btn-icon-sm -ml-1"
                            >
                                <BackIcon />
                            </button>
                            <span className="text-text-muted text-sm">Studio</span>
                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="panel-title">{viewTitles[activeView]}</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="panel-title">Studio</span>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeView ? (
                    // Inline Content View
                    renderInlineContent()
                ) : currentMaterial ? (
                    // Grid View
                    <>
                        <p className="text-xs text-text-muted mb-4">
                            Create study materials from <span className="text-text-secondary">{currentMaterial.filename}</span>
                        </p>

                        <div className="space-y-2">
                            {outputs.map((output) => (
                                <FeatureCard
                                    key={output.id}
                                    icon={output.icon}
                                    title={output.title}
                                    description={output.description}
                                    onClick={output.onClick}
                                    loading={loading[output.id]}
                                    disabled={!currentMaterial}
                                />
                            ))}
                        </div>

                        {(flashcardsData || quizData || slidesData || videoData || audioData) && (
                            <>
                                <div className="divider my-4" />
                                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Created</h3>
                                <div className="space-y-2">
                                    {audioData && (
                                        <button className="output-card w-full text-left" onClick={() => setActiveView('audio')}>
                                            <div className="output-card-icon bg-accent/10">
                                                <span className="text-accent-light"><AudioIcon /></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-text-primary">Audio Overview</h4>
                                                <p className="text-xs text-text-muted">Ready to play</p>
                                            </div>
                                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                    {flashcardsData && (
                                        <button className="output-card w-full text-left" onClick={() => setActiveView('flashcards')}>
                                            <div className="output-card-icon bg-accent/10">
                                                <span className="text-accent-light"><FlashcardsIcon /></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-text-primary">Flashcards</h4>
                                                <p className="text-xs text-text-muted">{flashcardsData.flashcards?.length || 0} cards</p>
                                            </div>
                                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                    {quizData && (
                                        <button className="output-card w-full text-left" onClick={() => setActiveView('quiz')}>
                                            <div className="output-card-icon bg-accent/10">
                                                <span className="text-accent-light"><QuizIcon /></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-text-primary">Quiz</h4>
                                                <p className="text-xs text-text-muted">{quizData.questions?.length || 0} questions</p>
                                            </div>
                                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                    {slidesData && (
                                        <button className="output-card w-full text-left" onClick={() => setActiveView('slides')}>
                                            <div className="output-card-icon bg-accent/10">
                                                <span className="text-accent-light"><SlidesIcon /></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-text-primary">Slides</h4>
                                                <p className="text-xs text-text-muted">{slidesData.slide_count || slidesData.slides?.length || 0} slides</p>
                                            </div>
                                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                    {videoData && (
                                        <button className="output-card w-full text-left" onClick={() => setActiveView('video')}>
                                            <div className="output-card-icon bg-accent/10">
                                                <span className="text-accent-light"><VideoIcon /></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-text-primary">Video Explainer</h4>
                                                <p className="text-xs text-text-muted">Ready to play</p>
                                            </div>
                                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="empty-state h-full">
                        <div className="empty-state-icon">
                            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <p className="empty-state-title">No source selected</p>
                        <p className="empty-state-description">Select a source to generate study materials</p>
                    </div>
                )}
            </div>
        </aside>
    );
}

// ==================== INLINE VIEW COMPONENTS ====================

function InlineAudioView({ data, materialId }) {
    const [downloading, setDownloading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const audioRef = useRef(null);

    const audioFilename = data?.audio_filename;
    const userId = data?.user_id;
    const title = data?.title || 'Audio Overview';

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await downloadPodcast(materialId);
            downloadBlob(blob, `${title.replace(/\s+/g, '_')}.wav`);
        } catch (error) {
            console.error('Failed to download audio:', error);
        } finally {
            setDownloading(false);
        }
    };

    const audioUrl = (audioFilename && userId) ? `http://localhost:8000/podcast/audio/${encodeURIComponent(userId)}/${encodeURIComponent(audioFilename)}` : null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const skip = (seconds) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
        }
    };

    const cycleSpeed = () => {
        const speeds = [1, 1.5, 2];
        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        const newSpeed = speeds[nextIndex];
        setPlaybackSpeed(newSpeed);
        if (audioRef.current) {
            audioRef.current.playbackRate = newSpeed;
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!audioUrl) {
        return (
            <div className="flex items-center justify-center h-40 text-text-muted glass rounded-xl">
                <p>Unable to load audio</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                    <p className="text-xs text-text-muted">Based on 1 source</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                        title="Download"
                    >
                        {downloading ? <div className="loading-spinner w-3 h-3" /> : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                        Download
                    </button>
                </div>
            </div>

            {/* Audio Icon */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-accent-light font-mono w-10">{formatTime(currentTime)}</span>
                <div
                    className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                </div>
                <span className="text-xs text-text-muted font-mono w-10 text-right">{formatTime(duration)}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={cycleSpeed}
                    className="px-2 py-1 text-sm font-medium text-accent-light hover:bg-accent/10 rounded-lg transition-colors"
                >
                    {playbackSpeed}X
                </button>
                <button
                    onClick={() => skip(-10)}
                    className="btn-icon text-text-secondary hover:text-white"
                    title="Rewind 10 seconds"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                </button>
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:bg-accent-light transition-colors shadow-lg"
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
                <button
                    onClick={() => skip(10)}
                    className="btn-icon text-text-secondary hover:text-white"
                    title="Forward 10 seconds"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function InlineFlashcardsView({ data }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const flashcards = data?.flashcards || [];

    const next = () => {
        if (isAnimating) return;
        setFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % flashcards.length), 150);
    };

    const prev = () => {
        if (isAnimating) return;
        setFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length), 150);
    };

    const handleFlip = () => {
        setIsAnimating(true);
        setFlipped(f => !f);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const downloadPDF = () => {
        setDownloading(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPos = margin;

            // Title page
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, pageWidth, 60, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('Flashcards', margin, 38);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`${flashcards.length} cards for studying`, margin, 50);

            yPos = 80;

            // Instructions
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text('Study tip: Cover the answers with a piece of paper while reviewing questions!', margin, yPos);
            yPos += 20;

            // Cards
            flashcards.forEach((card, index) => {
                const cardHeight = 55;

                // Check if we need a new page
                if (yPos + cardHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                }

                // Card number badge
                doc.setFillColor(59, 130, 246);
                doc.roundedRect(margin, yPos, 24, 10, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text(`#${index + 1}`, margin + 7, yPos + 7);

                // Question section
                doc.setFillColor(239, 246, 255);
                doc.roundedRect(margin, yPos + 12, contentWidth, 18, 3, 3, 'F');

                doc.setTextColor(59, 130, 246);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('QUESTION', margin + 5, yPos + 20);

                doc.setTextColor(30, 30, 30);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const questionLines = doc.splitTextToSize(card.question, contentWidth - 10);
                doc.text(questionLines.slice(0, 2).join(' '), margin + 5, yPos + 27);

                // Answer section
                doc.setFillColor(236, 253, 245);
                doc.roundedRect(margin, yPos + 32, contentWidth, 18, 3, 3, 'F');

                doc.setTextColor(34, 197, 94);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('ANSWER', margin + 5, yPos + 40);

                doc.setTextColor(30, 30, 30);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const answerLines = doc.splitTextToSize(card.answer, contentWidth - 10);
                doc.text(answerLines.slice(0, 2).join(' '), margin + 5, yPos + 47);

                yPos += cardHeight + 8;
            });

            // Footer on last page
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`Generated by KeplerLab • ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

            doc.save('flashcards-study-sheet.pdf');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === ' ') { e.preventDefault(); handleFlip(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flashcards.length, isAnimating]);

    if (flashcards.length === 0) return <p className="text-text-muted text-center py-8">No flashcards available</p>;

    const card = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-text-primary">Card {currentIndex + 1}</span>
                        <span className="text-xs text-text-muted"> / {flashcards.length}</span>
                    </div>
                </div>
                <button
                    onClick={downloadPDF}
                    disabled={downloading}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                    title="Download as PDF"
                >
                    {downloading ? (
                        <div className="loading-spinner w-3 h-3" />
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                    PDF
                </button>
            </div>

            {/* Progress bar */}
            <div className="progress-bar h-1.5 rounded-full">
                <div className="progress-fill rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Flashcard with 3D flip */}
            <div
                className="relative perspective-1000"
                style={{ perspective: '1000px' }}
            >
                {/* Card stack effect (decorative cards behind) */}
                <div className="absolute inset-0 rounded-2xl bg-dark-300 opacity-30 transform translate-y-2 translate-x-1 scale-[0.98]" />
                <div className="absolute inset-0 rounded-2xl bg-dark-200 opacity-50 transform translate-y-1 translate-x-0.5 scale-[0.99]" />

                {/* Main card */}
                <div
                    onClick={handleFlip}
                    className="relative cursor-pointer transition-transform duration-300 ease-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front (Question) */}
                    <div
                        className="min-h-[220px] rounded-2xl p-6 flex flex-col"
                        style={{
                            backfaceVisibility: 'hidden',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                                <span className="text-xs text-accent-light font-bold">Q</span>
                            </div>
                            <span className="text-xs font-medium text-accent-light uppercase tracking-wider">Question</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-center">
                            <p className="text-text-primary text-base leading-relaxed">{card.question}</p>
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-4 text-text-muted">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-xs">Tap to reveal answer</span>
                        </div>
                    </div>

                    {/* Back (Answer) */}
                    <div
                        className="absolute inset-0 min-h-[220px] rounded-2xl p-6 flex flex-col"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                            border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                                <span className="text-xs text-green-400 font-bold">A</span>
                            </div>
                            <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Answer</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-center">
                            <p className="text-text-primary text-base leading-relaxed">{card.answer}</p>
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-4 text-text-muted">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs">Got it? Move to next</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Keyboard hints */}
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
                <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-dark-300 text-text-secondary font-mono">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-dark-300 text-text-secondary font-mono">→</kbd>
                    <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-2 py-0.5 rounded bg-dark-300 text-text-secondary font-mono text-xs">Space</kbd>
                    <span>Flip</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
                <button
                    onClick={prev}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>
                <button
                    onClick={next}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function InlineQuizView({ data }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const questions = data?.questions || [];

    const handleAnswer = (option) => {
        setSelectedAnswer(option);
        if (option === questions[currentIndex].correct_answer) setScore(prev => prev + 1);
    };

    const next = () => {
        if (currentIndex < questions.length - 1) {
            setSelectedAnswer(null);
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
    };

    if (questions.length === 0) return <p className="text-text-muted text-center py-8">No quiz questions available</p>;

    const question = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const scorePercent = Math.round((score / questions.length) * 100);

    if (showResult) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-4">{scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '👍' : '📚'}</div>
                <h4 className="text-xl font-medium text-text-primary mb-2">
                    {scorePercent >= 80 ? 'Excellent!' : scorePercent >= 50 ? 'Good job!' : 'Keep studying!'}
                </h4>
                <p className="text-text-secondary mb-6">You scored {score} out of {questions.length} ({scorePercent}%)</p>
                <button onClick={restart} className="btn-primary">Try Again</button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-xs text-text-muted">Score: {score}</span>
            </div>

            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

            <p className="text-text-primary font-medium">{question.question}</p>

            <div className="space-y-2">
                {question.options?.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === question.correct_answer;
                    const showState = selectedAnswer !== null;
                    let stateClass = 'border-border hover:border-border-medium';
                    if (showState) {
                        if (isCorrect) stateClass = 'border-status-success bg-status-success/10';
                        else if (isSelected) stateClass = 'border-status-error bg-status-error/10';
                        else stateClass = 'border-border opacity-50';
                    }
                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={selectedAnswer !== null}
                            className={`w-full p-3 text-left rounded-xl border transition-all text-sm ${stateClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {/* Feedback after answer */}
            {selectedAnswer && (
                <div className={`p-3 rounded-xl text-sm font-medium ${selectedAnswer === question.correct_answer
                    ? 'bg-status-success/15 text-green-400 border border-status-success/30'
                    : 'bg-status-error/15 text-red-400 border border-status-error/30'
                    }`}>
                    {selectedAnswer === question.correct_answer ? (
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Correct!</span>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Wrong!</span>
                            </div>
                            <p className="text-xs text-text-secondary ml-7">Correct answer: {question.correct_answer}</p>
                        </div>
                    )}
                </div>
            )}

            {selectedAnswer && (
                <button onClick={next} className="btn-primary w-full">
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
            )}
        </div>
    );
}

function InlineSlidesView({ data, materialId }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const chapterTitle = data?.chapter_title || 'Presentation';
    const slides = data?.slides || [];
    const sessionId = data?.session_id;
    const slideCount = slides.length;

    const next = () => setCurrentIndex((prev) => Math.min(prev + 1, slideCount - 1));
    const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await downloadSlides(materialId);
            downloadBlob(blob, `${chapterTitle.replace(/\s+/g, '_')}.pptx`);
        } catch (error) {
            console.error('Failed to download slides:', error);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slideCount]);

    const currentSlide = slides[currentIndex];
    const imageUrl = (sessionId && currentSlide) ? `http://localhost:8000/slide/image/${encodeURIComponent(sessionId)}/${encodeURIComponent(currentSlide)}` : null;
    const progress = slideCount > 0 ? ((currentIndex + 1) / slideCount) * 100 : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-text-primary">{chapterTitle}</p>
                    <p className="text-xs text-text-muted">{slideCount} slides</p>
                </div>
                <button onClick={handleDownload} disabled={downloading} className="btn-secondary text-xs flex items-center gap-1.5">
                    {downloading ? <div className="loading-spinner w-3 h-3" /> : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    )}
                    PPTX
                </button>
            </div>

            <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

            {imageUrl ? (
                <div className="flex items-center justify-center glass rounded-xl p-2" style={{ minHeight: '200px' }}>
                    <img src={imageUrl} alt={`Slide ${currentIndex + 1}`} className="max-w-full h-auto rounded-lg" style={{ maxHeight: '300px' }} />
                </div>
            ) : (
                <div className="flex items-center justify-center h-40 text-text-muted glass rounded-xl">
                    <p>{data?.error ? `Error: ${data.error}` : 'No slides available'}</p>
                </div>
            )}

            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted">{currentIndex + 1} / {slideCount}</span>
                <div className="flex gap-2">
                    <button onClick={prev} disabled={currentIndex === 0} className="btn-secondary text-xs disabled:opacity-50">Prev</button>
                    <button onClick={next} disabled={currentIndex === slideCount - 1} className="btn-primary text-xs disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
}

function InlineVideoView({ data, materialId }) {
    const [downloading, setDownloading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const videoFilename = data?.video_filename;
    const userId = data?.user_id;
    const title = data?.title || 'Video Overview';

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await downloadExplainer(materialId);
            downloadBlob(blob, 'explainer.mp4');
        } catch (error) {
            console.error('Failed to download video:', error);
        } finally {
            setDownloading(false);
        }
    };

    const videoUrl = (videoFilename && userId) ? `http://localhost:8000/explainer/video/${encodeURIComponent(userId)}/${encodeURIComponent(videoFilename)}` : null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
        }
    };

    const cycleSpeed = () => {
        const speeds = [1, 1.5, 2];
        const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        const newSpeed = speeds[nextIndex];
        setPlaybackSpeed(newSpeed);
        if (videoRef.current) {
            videoRef.current.playbackRate = newSpeed;
        }
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!videoUrl) {
        return (
            <div className="flex items-center justify-center h-40 text-text-muted glass rounded-xl">
                <p>Unable to load video</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-3 media-player-container">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                    <p className="text-xs text-text-muted">Based on 1 source</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="btn-icon-sm text-text-muted hover:text-white"
                        title="Share"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="btn-icon-sm text-text-muted hover:text-white"
                        title="Download"
                    >
                        {downloading ? <div className="loading-spinner w-4 h-4" /> : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full"
                    style={{ maxHeight: isFullscreen ? '80vh' : '240px' }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onClick={togglePlay}
                />
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-accent-light font-mono w-10">{formatTime(currentTime)}</span>
                <div
                    className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `calc(${progress}% - 6px)` }}
                    />
                </div>
                <span className="text-xs text-text-muted font-mono w-10 text-right">{formatTime(duration)}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={cycleSpeed}
                    className="px-2 py-1 text-sm font-medium text-accent-light hover:bg-accent/10 rounded-lg transition-colors"
                >
                    {playbackSpeed}X
                </button>
                <button
                    onClick={() => skip(-10)}
                    className="btn-icon text-text-secondary hover:text-white"
                    title="Rewind 10 seconds"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                </button>
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-accent flex items-center justify-center hover:bg-accent-light transition-colors shadow-lg"
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
                <button
                    onClick={() => skip(10)}
                    className="btn-icon text-text-secondary hover:text-white"
                    title="Forward 10 seconds"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="btn-icon text-text-secondary hover:text-white"
                    title="Fullscreen"
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Feedback Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
                <button
                    onClick={() => setFeedback('good')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${feedback === 'good'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Good video
                </button>
                <button
                    onClick={() => setFeedback('bad')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${feedback === 'bad'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    Bad video
                </button>
            </div>
        </div>
    );
}
