import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { useFormStore } from './store/formStore';

// Import form components
import InitialForm from './components/forms/InitialForm';
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
        await initializeSession(sessionId);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load session:', err);
        setError(sessionId ? `Session ${sessionId} not found or invalid.` : 'Failed to load session. Please try again.');
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Session Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};



const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Initial Form - Homepage */}
        <Route 
          path="/" 
          element={
            <SessionLoader>
              <InitialForm />
            </SessionLoader>
          } 
        />
        
        {/* Follow-up Form - Detailed form using existing components */}
        <Route 
          path="/follow-up/:sessionId" 
          element={
            <SessionLoader>
              <FollowUpForm />
            </SessionLoader>
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
        
        {/* Fallback to home page for any other routes */}
        <Route 
          path="*" 
          element={
            <SessionLoader>
              <InitialForm />
            </SessionLoader>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes; 