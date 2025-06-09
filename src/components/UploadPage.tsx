import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Label } from './ui/label';
import FileUpload from './FileUpload';
import FormCard from './FormCard';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

import { useParams } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpload = (urls: string[]) => {
    setUploadedImages(prev => [...prev, ...urls]);
  };

  const handleSubmit = async () => {
    if (uploadedImages.length === 0 || isSubmitting || isSuccess) return;
    
    if (!sessionId) {
      console.error('No session ID found');
      alert('Invalid upload link. Please use the link sent to you.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Submitting photos to Supabase with sessionId:', sessionId);
      
      // Update the session with uploaded photos
      const { error } = await supabase
        .from('form_sessions')
        .update({
          photo_urls: uploadedImages,
          photos_uploaded: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error updating photos in database:', error);
        throw error;
      }
      
      console.log('Photos successfully saved to database');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/upload-complete');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit uploads:', error);
      alert('An error occurred while saving photos. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <FormCard
        title="Upload Property Photos"
        description="Add photos of your property to help us provide an accurate quote"
        footerContent={
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={uploadedImages.length === 0 || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : isSuccess ? (
                'Submitted!'
              ) : (
                'Done'
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Upload Photos</Label>
            <FileUpload
              onUpload={handleUpload}
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
            />
            <p className="text-sm text-gray-500">
              You can upload up to 10 images, each up to 10MB in size
            </p>
          </div>

          {uploadedImages.length > 0 && (
            <p className="text-sm text-green-600">
              {uploadedImages.length} {uploadedImages.length === 1 ? 'image' : 'images'} uploaded
            </p>
          )}
        </div>
      </FormCard>
    </div>
  );
};

export default UploadPage;