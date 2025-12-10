import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const { public_id } = await request.json();

    if (!public_id) {
        return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    try {
        const resource = await cloudinary.api.resource(public_id);
        const tags = resource.tags || [];

        // Check definitive statuses
        if (tags.includes('safe-and-processed')) {
            return NextResponse.json({ status: 'approved' });
        }

        if (tags.includes('unsafe-content')) {
            return NextResponse.json({ status: 'rejected' });
        }

        // If neither tag exists yet, it is still processing
        return NextResponse.json({ status: 'processing' });
    } catch (error) {
        return NextResponse.json({ error: 'Error checking status' }, { status: 500 });
    }
}