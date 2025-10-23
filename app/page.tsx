import Uploader from '@/components/Uploader';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold'>
              Safe Media Uploader
            </CardTitle>
            <CardDescription>
              Upload an image to see the moderation in action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Uploader />
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Link
              href='/gallery'
              className='px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors'
            >
              View Approved Gallery
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
