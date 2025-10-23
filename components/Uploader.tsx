'use client';

import { CldUploadButton } from 'next-cloudinary';
import { useState } from 'react';

// Define the shape of the Cloudinary upload result
interface CloudinaryResult {
  public_id: string;
}

export default function Uploader() {
  const [imageId, setImageId] = useState('');

  return (
    <div>
      <CldUploadButton
        // Replace with your actual upload preset name
        uploadPreset='kidsafe-mediaflow-blog'
        onSuccess={(result) => {
          // Type assertion to ensure result.info has the expected shape
          const info = result.info as CloudinaryResult;
          setImageId(info.public_id);
        }}
        className='w-full justify-center h-48 border-2 border-dashed rounded-lg flex items-center bg-gray-50 hover:bg-gray-100 transition-colors'
      >
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

      {imageId && (
        <div className='mt-4'>
          <p className='font-semibold'>Your image is uploaded!</p>
          <p className='text-sm text-gray-500'>Public ID: {imageId}</p>
          {/* We will display the moderated image here later */}
        </div>
      )}
    </div>
  );
}
