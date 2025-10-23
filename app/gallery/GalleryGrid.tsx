'use client';

import { CldImage } from 'next-cloudinary';
import { CloudinaryResource } from './page';

export default function GalleryGrid({
  resources,
}: {
  resources: CloudinaryResource[];
}) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
      {resources.map((resource) => (
        <div key={resource.public_id} className='aspect-square'>
          <CldImage
            src={resource.public_id}
            width='400'
            height='400'
            alt='An approved and moderated image'
            className='w-full h-full object-cover rounded-lg shadow-md'
            // We apply the effects here again for consistency
            effects={[{ blurFaces: true }, { cartoonify: true }]}
            crop='fill'
            gravity='auto'
          />
        </div>
      ))}
    </div>
  );
}
