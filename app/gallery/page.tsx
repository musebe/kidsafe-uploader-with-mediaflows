import { v2 as cloudinary } from 'cloudinary';
import GalleryGrid from './GalleryGrid';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function GalleryPage() {
  let resources: CloudinaryResource[] = [];

  try {
    const searchResult = await cloudinary.search
      .expression('folder=kid-safe-platform AND tags=safe-and-processed')
      .sort_by('created_at', 'desc')
      // REMOVED THE INVALID LINE BELOW
      // .with_field('secure_url')
      .max_results(30)
      .execute();

    resources = searchResult.resources as CloudinaryResource[];
  } catch (error) {
    console.error('Error fetching from Cloudinary:', error);
  }

  return (
    <main className='flex min-h-screen w-full flex-col items-center bg-gray-100 dark:bg-gray-900 p-4 sm:p-8'>
      <div className='w-full max-w-5xl'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>Approved Images</h1>
          <Link
            href='/'
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Upload More
          </Link>
        </div>

        {resources.length > 0 ? (
          <GalleryGrid resources={resources} />
        ) : (
          <div className='text-center text-gray-500 mt-12'>
            <p>No approved images found yet.</p>
            <p className='text-sm mt-2'>
              (If you&apos;ve uploaded images, there might be an issue fetching
              them.)
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
