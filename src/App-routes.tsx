import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { useFormStore } from './store/formStore';

// Import form components
import AgentForm from './components/forms/AgentForm';
import FollowUpForm from './components/forms/FollowUpForm';
import UploadPage from './components/UploadPage';

interface SessionLoaderProps {
  children: React.ReactNode;
}

const SessionLoader: React.FC<SessionLoaderProps> = ({ children }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { initializeSession } = useFormStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('🔄 SessionLoader: Loading session...', { sessionId });
        await initializeSession(sessionId);
        console.log('✅ SessionLoader: Session loaded successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('❌ SessionLoader: Failed to load session:', err);
        const errorMessage = sessionId 
          ? `Session ${sessionId} not found. This link may be expired or invalid.` 
          : 'Failed to load session. Please try again.';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, initializeSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
          {sessionId && <p className="text-sm text-gray-400 mt-2">Session ID: {sessionId}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {sessionId && (
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="text-sm text-gray-600">Session ID: <code className="bg-gray-200 px-1 rounded">{sessionId}</code></p>
            </div>
          )}
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                // Try to close the tab first
                try {
                  window.close();
                  // If window.close() doesn't work (e.g., not opened by script), redirect after a short delay
                  setTimeout(() => {
                    window.location.href = 'https://villandscaping.ca';
                  }, 100);
                } catch (error) {
                  // Fallback to redirect
                  window.location.href = 'https://villandscaping.ca';
                }
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            >
              Exit
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            If you continue to have issues, please clear your browser cache and try again.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  // Check if we're in embed mode
  const isEmbedMode = !(document.getElementById('root'));
  
  const routerContent = (
    <Router>
      <Routes>
        {/* Home Page - Redirect to main website */}
        <Route 
          path="/" 
          element={
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Access</h1>
                <p className="text-gray-600 mb-4">
                  This form is accessed through direct links only. Please visit our main website to get started.
                </p>
                <button 
                  onClick={() => window.location.href = 'https://villandscaping.ca'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Visit VIL Landscaping
                </button>
              </div>
            </div>
          } 
        />
        
        {/* Follow-up Form - Now the main customer form */}
        <Route 
          path="/follow-up/:sessionId" 
          element={
            <FollowUpForm />
          } 
        />
        
        {/* Agent Form - Internal single-page form */}
        <Route 
          path="/internal" 
          element={
            <SessionLoader>
              <AgentForm />
            </SessionLoader>
          } 
        />
        
        {/* Upload Form - Standalone photo upload */}
        <Route 
          path="/upload/:sessionId" 
          element={
            <SessionLoader>
              <UploadPage />
            </SessionLoader>
          } 
        />
        
        {/* Upload Complete Page */}
        <Route 
          path="/upload-complete" 
          element={
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Photos Uploaded Successfully!</h1>
                <p className="text-gray-600">Thank you for uploading your property photos. We'll review them and get back to you soon.</p>
              </div>
            </div>
          } 
        />
        
        {/* Debug Route - Remove in production */}
        <Route 
          path="/debug" 
          element={
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="text-center max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Information</h1>
                <div className="bg-gray-50 p-4 rounded-md text-left space-y-2">
                  <p><strong>Current URL:</strong> {window.location.href}</p>
                  <p><strong>Path:</strong> {window.location.pathname}</p>
                  <p><strong>Search:</strong> {window.location.search}</p>
                  <p><strong>Hash:</strong> {window.location.hash}</p>
                  <p><strong>Local Storage Session:</strong> {localStorage.getItem('currentSessionId') || 'None'}</p>
                  <p><strong>Embed Mode:</strong> {!(document.getElementById('root')) ? 'Yes' : 'No'}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => localStorage.clear()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md mr-2"
                  >
                    Clear Local Storage
                  </button>
                  <button 
                    onClick={() => window.location.href = 'https://villandscaping.ca'}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
                  >
                    Go to Main Website
                  </button>
                </div>
              </div>
            </div>
          } 
        />
        
        {/* Fallback - Redirect to main website */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => window.location.href = 'https://villandscaping.ca'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Visit VIL Landscaping
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
  
  // Wrap in scoped container if in embed mode
  if (isEmbedMode) {
    return (
      <div className="vl-form-wrapper" data-vl-form="true">
        {routerContent}
      </div>
    );
  }
  
  return routerContent;
};

export default AppRoutes; 