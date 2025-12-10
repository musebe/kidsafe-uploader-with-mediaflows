'use client';

import {
  CldUploadButton,
  CldImage,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import { useState, useCallback } from 'react';

interface CloudinaryResult {
  public_id: string;
  width: number;
  height: number;
}

// Extended states for better UI feedback
type UploadStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'error';

export default function Uploader() {
  const [result, setResult] = useState<CloudinaryResult | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');

  // Recursive Polling Function
  const checkModerationStatus = useCallback(
    async (publicId: string, attempt = 1) => {
      // Safety break: Stop after 30 attempts (approx 60 seconds)
      if (attempt > 30) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch('/api/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId }),
        });

        if (!response.ok) throw new Error('Network error');

        const data = await response.json();

        if (data.status === 'processing') {
          // If still processing, wait 2 seconds and try again
          console.log(`Attempt ${attempt}: Still processing...`);
          setTimeout(() => checkModerationStatus(publicId, attempt + 1), 2000);
        } else {
          // Final state reached (approved/rejected)
          setStatus(data.status);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setStatus('error');
      }
    },
    []
  );

  const handleUploadStart = () => {
    setStatus('uploading');
  };

  const handleSuccess = (uploadResult: CloudinaryUploadWidgetResults) => {
    if (typeof uploadResult.info === 'object') {
      const info = uploadResult.info as CloudinaryResult;
      setResult(info);
      setStatus('processing');
      // Begin the client-side polling loop
      checkModerationStatus(info.public_id);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
  };

  // Helper to render the specific UI for each state
  const renderContent = () => {
    switch (status) {
      case 'idle':
      case 'uploading':
        return (
          <CldUploadButton
            uploadPreset='kidsafe-mediaflow-blog'
            options={{ tags: ['moderation-queue'] }}
            onUploadAdded={handleUploadStart} // Trigger loading state immediately
            onSuccess={handleSuccess}
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-200 
              ${
                status === 'uploading'
                  ? 'bg-gray-100 border-gray-300 cursor-wait opacity-50'
                  : 'bg-gray-50 border-gray-300 hover:bg-white hover:border-blue-500 hover:shadow-md'
              }`}
          >
            {status === 'uploading' ? (
              <div className='flex flex-col items-center animate-pulse'>
                <svg
                  className='animate-spin h-10 w-10 text-blue-500 mb-3'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                <span className='text-sm font-medium text-gray-500'>
                  Uploading to Cloud...
                </span>
              </div>
            ) : (
              <>
                <div className='p-4 bg-white rounded-full shadow-sm mb-4'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-8 w-8 text-blue-500'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Upload Image
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Click to browse or drag file here
                </p>
              </>
            )}
          </CldUploadButton>
        );

      case 'processing':
        return (
          <div className='w-full h-64 border-2 border-blue-100 bg-blue-50 rounded-xl flex flex-col items-center justify-center p-6 text-center'>
            <span className='relative flex h-6 w-6 mb-4'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-6 w-6 bg-blue-500'></span>
            </span>
            <h3 className='text-xl font-semibold text-blue-900 mb-2'>
              Analyzing Content
            </h3>
            <p className='text-blue-700/80 max-w-xs text-sm'>
              Our AI is checking this image for safety compliance. This usually
              takes a few seconds.
            </p>
          </div>
        );

      case 'approved':
        return (
          <div className='bg-white border rounded-xl shadow-sm overflow-hidden'>
            <div className='bg-green-50 border-b border-green-100 p-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='bg-green-100 p-1 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 text-green-600'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <span className='font-semibold text-green-900'>
                  Upload Approved
                </span>
              </div>
              <button
                onClick={handleReset}
                className='text-xs font-medium text-green-700 hover:text-green-900 underline'
              >
                Upload New
              </button>
            </div>

            <div className='p-6 bg-gray-50 flex justify-center'>
              {result && (
                <CldImage
                  src={result.public_id}
                  width={600}
                  height={400} // Simplified for demo, keeps aspect ratio usually
                  alt='Moderated image'
                  effects={[{ blurFaces: true }, { cartoonify: true }]}
                  className='rounded-lg shadow-md max-h-[400px] w-auto object-contain'
                />
              )}
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div className='w-full border-2 border-red-100 bg-red-50 rounded-xl p-8 text-center'>
            <div className='bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-red-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-red-900 mb-2'>
              Content Rejected
            </h3>
            <p className='text-red-700 mb-6 max-w-md mx-auto'>
              This image was flagged by our safety filters and cannot be
              displayed.
            </p>
            <button
              onClick={handleReset}
              className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors'
            >
              Try Different Image
            </button>
          </div>
        );

      case 'error':
        return (
          <div className='text-center p-6'>
            <p className='text-red-500 mb-4'>
              Something went wrong checking the status.
            </p>
            <button onClick={handleReset} className='text-blue-600 underline'>
              Try Again
            </button>
          </div>
        );
    }
  };

  return <div className='max-w-2xl mx-auto p-4'>{renderContent()}</div>;
}
