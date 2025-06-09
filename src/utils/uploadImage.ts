import { supabase } from '../lib/supabase'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  url: string
  path: string
  size: number
}

export const uploadImage = async (
  file: File, 
  sessionId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.')
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Please upload images smaller than 10MB.')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${sessionId}/${timestamp}-${randomString}.${fileExtension}`

    // Create a progress tracking wrapper if needed
    let uploadFile = file
    if (onProgress) {
      // Note: Supabase doesn't provide native upload progress
      // This is a simulation for UX purposes
      const simulateProgress = () => {
        let loaded = 0
        const total = file.size
        const interval = setInterval(() => {
          loaded += total * 0.1 // Simulate 10% increments
          if (loaded >= total) {
            loaded = total
            clearInterval(interval)
          }
          onProgress({
            loaded,
            total,
            percentage: Math.round((loaded / total) * 100)
          })
        }, 100)
      }
      simulateProgress()
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-photos')
      .upload(fileName, uploadFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-photos')
      .getPublicUrl(fileName)

    return {
      url: publicUrl,
      path: data.path,
      size: file.size
    }
  } catch (error) {
    console.error('Image upload error:', error)
    throw error
  }
}

export const deleteImage = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('property-photos')
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Image delete error:', error)
    throw error
  }
}

export const uploadMultipleImages = async (
  files: File[],
  sessionId: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onComplete?: (fileIndex: number, result: UploadResult) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadImage(
        files[i], 
        sessionId, 
        onProgress ? (progress) => onProgress(i, progress) : undefined
      )
      results.push(result)
      if (onComplete) onComplete(i, result)
    } catch (error) {
      console.error(`Failed to upload file ${i}:`, error)
      throw error
    }
  }
  
  return results
}

// Utility to get optimized image URL (for future CDN integration)
export const getOptimizedImageUrl = (url: string, width?: number, height?: number): string => {
  // For now, return the original URL
  // In the future, you could integrate with Supabase's image transformation
  // or a CDN service for optimization
  return url
} 