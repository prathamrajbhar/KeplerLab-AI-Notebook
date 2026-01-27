import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';

function Workspace() {
  const { user } = useAuth();
  const { setCurrentNotebook, setDraftMode, setMaterials, setMessages, setCurrentMaterial } = useApp();

  const handleBack = () => {
    setCurrentNotebook(null);
    setDraftMode(false);
    setMaterials([]);
    setMessages([]);
    setCurrentMaterial(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dark">
      <Header user={user} onBack={handleBack} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatPanel />
        <StudioPanel />
      </div>
    </div>
  );
}

function MainApp() {
  const { currentNotebook, setCurrentNotebook, setDraftMode } = useApp();

  const handleCreateNew = () => {
    setDraftMode(true);
    setCurrentNotebook({ id: 'draft', name: 'New Notebook', isDraft: true });
  };

  return currentNotebook ? (
    <Workspace />
  ) : (
    <HomePage
      onSelectNotebook={setCurrentNotebook}
      onCreateNew={handleCreateNew}
    />
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner w-10 h-10" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AppProvider>
      <MainApp />
    </AppProvider>
  ) : (
    <AuthPage />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
