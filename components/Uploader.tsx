'use client';

import {
  CldUploadButton,
  CldImage,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import { useState } from 'react';

interface CloudinaryResult {
  public_id: string;
  width: number;
  height: number;
}

// NEW: Define possible states for our UI
type UploadStatus = 'idle' | 'processing' | 'approved' | 'rejected' | 'error';

export default function Uploader() {
  const [result, setResult] = useState<CloudinaryResult | null>(null);
  // NEW: State to track the definitive moderation status
  const [status, setStatus] = useState<UploadStatus>('idle');

  const checkModerationStatus = async (publicId: string) => {
    try {
      const response = await fetch('/api/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (!response.ok) {
        throw new Error('Status check failed');
      }

      const data = await response.json();
      setStatus(data.status); // Will be 'approved' or 'rejected'
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleSuccess = (uploadResult: CloudinaryUploadWidgetResults) => {
    if (!uploadResult.info || typeof uploadResult.info !== 'object') {
      console.error('Upload result is missing info object');
      return;
    }
    const info = uploadResult.info as CloudinaryResult;
    setResult(info);
    setStatus('processing');
    // Start checking the status immediately after upload
    checkModerationStatus(info.public_id);
  };

  // Helper function to render UI based on status
  const renderStatusMessage = () => {
    switch (status) {
      case 'processing':
        return (
          <div className='text-center'>
            <h3 className='text-xl font-semibold mb-2'>
              Analyzing for Safety...
            </h3>
            <p className='text-gray-600'>
              Please wait while we process your image.
            </p>
          </div>
        );
      case 'approved':
        return (
          <div>
            <h3 className='text-xl font-semibold text-center mb-4'>
              Upload Approved!
            </h3>
            <div className='flex justify-center'>
              <CldImage
                src={result!.public_id}
                width={result!.width > 600 ? 600 : result!.width}
                height={
                  result!.height > 600
                    ? (result!.height * 600) / result!.width
                    : result!.height
                }
                alt='Moderated and enhanced image'
                effects={[{ blurFaces: true }, { cartoonify: true }]}
                className='rounded-lg shadow-lg'
              />
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className='text-center p-4 border border-red-500 bg-red-50 rounded-lg'>
            <h3 className='text-xl font-semibold text-red-700 mb-2'>
              Upload Rejected
            </h3>
            <p className='text-red-600'>
              This image did not meet our safety guidelines.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <CldUploadButton
        uploadPreset='kidsafe-mediaflow-blog'
        options={{ tags: ['moderation-queue'] }}
        onSuccess={handleSuccess}
        className='w-full justify-center h-48 border-2 border-dashed rounded-lg flex items-center bg-gray-50 hover:bg-gray-100 transition-colors'
      >
        {/* SVG and text content */}
        <div className='text-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
            />
          </svg>
          <span className='mt-2 block text-sm font-medium text-gray-600'>
            Click to upload an image
          </span>
        </div>
      </CldUploadButton>

      {status !== 'idle' && <div className='mt-8'>{renderStatusMessage()}</div>}
    </div>
  );
}
