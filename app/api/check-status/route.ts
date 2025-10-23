import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to add a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
    const { public_id } = await request.json();

    if (!public_id) {
        return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
    }

    // Poll Cloudinary for up to 21 seconds to allow for API propagation delay
    for (let i = 0; i < 7; i++) { // MODIFIED: Increased attempts from 5 to 7
        try {
            const resource = await cloudinary.api.resource(public_id);
            const tags = resource.tags || [];

            console.log(`Attempt ${i + 1}: Checking tags for ${public_id}`, tags);

            if (tags.includes('safe-and-processed')) {
                return NextResponse.json({ status: 'approved' });
            }

            if (tags.includes('unsafe-content')) {
                return NextResponse.json({ status: 'rejected' });
            }

            // Wait for 3 seconds before the next check
            await delay(3000); // MODIFIED: Increased delay from 2s to 3s

        } catch (error) {
            console.error('Error checking resource:', error);
            return NextResponse.json({ error: 'Failed to check image status' }, { status: 500 });
        }
    }

    // If no final tag is found after 21 seconds, timeout
    console.log(`Polling timed out for ${public_id}.`);
    return NextResponse.json({ status: 'timeout' }, { status: 408 });
}