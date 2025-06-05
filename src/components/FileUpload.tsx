import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Progress } from './ui/progress';
import { Camera, ImagePlus, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUpload, 
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'property-uploads');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dkjm9uscp/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, maxFiles - uploadingFiles.length);
    const uploadedUrls: string[] = [];

    const newUploadingFiles = newFiles.map(file => ({
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        // Update progress to show uploading
        setUploadingFiles(prev => 
          prev.map((f) => 
            f.file === file ? { ...f, progress: 50 } : f
          )
        );
        
        const url = await uploadFile(file);
        
        // Update with completed upload
        setUploadingFiles(prev => 
          prev.map((f) => 
            f.file === file ? { ...f, progress: 100, url } : f
          )
        );
        
        uploadedUrls.push(url);
      } catch (error) {
        setUploadingFiles(prev => 
          prev.map((f) => 
            f.file === file ? { ...f, error: 'Upload failed' } : f
          )
        );
      }
    }
    
    // Call onUpload ONCE with all the new URLs
    if (uploadedUrls.length > 0) {
      onUpload(uploadedUrls);
    }
  }, [uploadingFiles.length, maxFiles, onUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.heic']
    },
    maxSize,
    maxFiles: maxFiles - uploadingFiles.length,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false)
  });

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center space-y-4">
          <ImagePlus className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-base font-medium">Drag and drop your images here</p>
            <p className="text-sm text-gray-500">or</p>
            <div className="mt-2 flex gap-2 justify-center">
              <Button onClick={open} variant="outline">
                Browse Files
              </Button>
              <Button 
                onClick={open} 
                variant="outline"
                className="md:hidden"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Maximum {maxFiles} images, up to {maxSize / (1024 * 1024)}MB each
          </p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadingFiles.map((file, index) => (
            <div 
              key={index} 
              className="relative group aspect-square border rounded-lg overflow-hidden"
            >
              {file.url ? (
                <>
                  <img
                    src={file.url}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  {file.error ? (
                    <div className="text-center text-red-500">
                      <Trash2 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Upload Failed</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-2 truncate w-full">
                        {file.file.name}
                      </p>
                      <Progress value={file.progress} className="w-full" />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;