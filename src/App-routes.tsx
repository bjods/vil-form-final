import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { useFormStore } from './store/formStore';

// Import form components
import InitialForm from './components/forms/InitialForm';
import AgentForm from './components/forms/AgentForm';
import UploadPage from './components/UploadPage';

// Import existing App for follow-up form
import App from './App';

interface SessionLoaderProps {
  children: React.ReactNode;
}

const SessionLoader: React.FC<SessionLoaderProps> = ({ children }) => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { initializeSession } = useFormStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (sessionId) {
        // Load specific session
        localStorage.setItem('currentSessionId', sessionId);
      }
      await initializeSession();
      setIsLoading(false);
    };

    loadSession();
  }, [sessionId, initializeSession]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Wrapper component for the follow-up form that uses the existing detailed form
const FollowUpForm: React.FC = () => {
  return <App />;
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
        
        {/* Fallback to existing form for any other routes */}
        <Route 
          path="*" 
          element={
            <SessionLoader>
              <FollowUpForm />
            </SessionLoader>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes; 