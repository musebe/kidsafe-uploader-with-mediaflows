import Uploader from '@/components/Uploader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
            {/* Replace the placeholder with our Uploader component */}
            <Uploader />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
