'use client';

import { CldImage } from 'next-cloudinary';
import { CloudinaryResource } from './page';
import { useState } from 'react';

export default function GalleryGrid({
  resources,
}: {
  resources: CloudinaryResource[];
}) {
  // State to toggle between Original and Processed views
  const [viewMode, setViewMode] = useState<'processed' | 'original'>(
    'processed'
  );

  if (!resources || resources.length === 0) {
    return (
      <div className='text-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300'>
        No images found.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 1. Control Bar with Toggle */}
      <div className='flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200'>
        <h2 className='font-semibold text-gray-700'>Gallery View</h2>

        <div className='flex items-center gap-3'>
          <span
            className={`text-sm font-medium ${
              viewMode === 'original' ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            Original
          </span>

          <button
            onClick={() =>
              setViewMode((prev) =>
                prev === 'processed' ? 'original' : 'processed'
              )
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              viewMode === 'processed' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                viewMode === 'processed' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          <span
            className={`text-sm font-medium ${
              viewMode === 'processed' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            Processed (Safe)
          </span>
        </div>
      </div>

      {/* 2. Masonry Layout (CSS Columns) */}
      {/* This prevents cropping by letting images dictate their own height */}
      <div className='columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'>
        {resources.map((resource) => (
          <div
            key={resource.public_id}
            className='break-inside-avoid relative overflow-hidden rounded-lg bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300 group'
          >
            <CldImage
              src={resource.public_id}
              width={500}
              height={500}
              alt='Gallery image'
              // CSS Fix: Use w-full + h-auto to respect natural aspect ratio
              className='w-full h-auto block'
              // Conditional Effects based on Toggle
              {...(viewMode === 'processed' && {
                effects: [{ blurFaces: true }, { cartoonify: true }],
              })}
              sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw'
              placeholder='blur'
              blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            />

            {/* Hover Badge showing current status */}
            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm text-white ${
                  viewMode === 'processed' ? 'bg-blue-500/80' : 'bg-gray-500/80'
                }`}
              >
                {viewMode === 'processed' ? 'AI Edited' : 'Original'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
