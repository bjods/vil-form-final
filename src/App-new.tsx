import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { InitialForm } from './components/forms/InitialForm'
import { AgentForm } from './components/forms/AgentForm'
import { ROUTES } from './types/routing'

// Placeholder components for forms we haven't built yet
const FollowUpForm = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Follow-up Form</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  </div>
)

const UploadForm = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Photo Upload</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  </div>
)

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
        Go back to home
      </a>
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Initial Form - Public facing minimal form */}
          <Route path={ROUTES.INITIAL} element={<InitialForm />} />
          
          {/* Follow-up Form - Detailed form sent via email */}
          <Route path={ROUTES.FOLLOW_UP} element={<FollowUpForm />} />
          
          {/* Agent Form - Internal comprehensive form */}
          <Route path={ROUTES.AGENT} element={<AgentForm />} />
          
          {/* Upload Form - Standalone photo upload */}
          <Route path={ROUTES.UPLOAD} element={<UploadForm />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App 