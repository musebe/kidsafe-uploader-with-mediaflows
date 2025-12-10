# Beyond Manual Moderation: Creating a Truly Kid-Safe Platform with Next.js and Cloudinary MediaFlows

Building platforms for children comes with a profound responsibility: ensuring every piece of content is safe. Traditional manual moderation is slow, expensive, and simply can't keep up with the scale of modern user-generated content. A single inappropriate image slipping through the cracks can have serious consequences. So, how can we build a truly reliable safety net?

In this guide, we'll move beyond manual checks and build a powerful, automated safety pipeline. We'll use the visual workflow builder [**Cloudinary MediaFlows**](https://cloudinary.com/documentation/mediaflows) to instantly scan uploads for unsafe content, protect children's privacy by blurring faces, and apply fun, kid-friendly enhancements. We'll then integrate this pipeline into a **Next.js** application, creating a secure frontend that only displays content *after* it has been officially approved.

By the end, you'll have a fully functional application that not only moderates content but also provides a secure and engaging user experience.

- **Live Demo:** [kidsafe-uploader-with-mediaflows.vercel.app](https://kidsafe-uploader-with-mediaflows.vercel.app/)
- **GitHub Repo:** [github.com/musebe/kidsafe-uploader-with-mediaflows](https://github.com/musebe/kidsafe-uploader-with-mediaflows)

### Prerequisites

Before we start, make sure you have the following:

- Node.js (v18 or later) installed.
- A free [Cloudinary account](https://cloudinary.com/users/register/free).
- Basic knowledge of React and Next.js.

Ready to build a safer internet for kids? Let's dive in.

### Step 1: Setting Up the Next.js Foundation

First, we need a solid foundation. We'll spin up a new Next.js project and use the excellent [`shadcn/ui`](https://ui.shadcn.com/) library to quickly build a clean, responsive interface.

### 1. Create the Next.js App

Open your terminal and run the `create-next-app` command. We'll be using the App Router, TypeScript, and Tailwind CSS.

```bash
npx create-next-app@latest kidsafe-uploader-with-mediaflows
```

Follow the prompts, accepting the defaults for a standard setup.

You can view the full project structure on GitHub:

 [kidsafe-uploader-with-mediaflows](https://github.com/musebe/kidsafe-uploader-with-mediaflows)

### 2. Initialize shadcn/ui

Next, add [`shadcn/ui`](https://github.com/shadcn/ui) to handle component styling.

This command configures `tailwind.config.ts` and global CSS automatically:

```bash
npx shadcn-ui@latest init
```

Accept the default options for all questions.

### 3. Build the Basic UI Layout

Let’s create a centered card that will hold our upload widget.

Add the `Card` component from `shadcn/ui`:

```bash
npx shadcn-ui@latest add card
```

Now, in [`app/page.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/page.tsx), create a clean landing page layout.

The core of the page is a `Card` component that centers our application.

```tsx
// In app/page.tsx
<main className="flex min-h-screen items-center justify-center">
  <div className="w-full max-w-md">
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Safe Media Uploader</CardTitle>
        <CardDescription>...</CardDescription>
      </CardHeader>
      <CardContent>{/* Uploader component will go here */}</CardContent>
    </Card>
  </div>
</main>;
```

You can view the full component file here: [`app/page.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/page.tsx)

With this basic layout in place, we’re ready to move on to the next step: building the automated safety pipeline.

### Step 2: Building the Visual Safety Pipeline with MediaFlows

This is where the magic happens. Instead of writing complex backend code, we'll use Cloudinary's visual workflow builder, **MediaFlows**, to create our entire safety and enhancement pipeline. It's like building with logic blocks.

Navigate to **MediaFlows** in your Cloudinary dashboard and create a new flow. We'll add and configure blocks in sequence.

### 1. The Trigger: An Upload with a Tag

Every flow needs to know when to start. We'll trigger ours whenever an image is uploaded with a specific tag.

- **Block**: `File Upload`
- **Configuration**: Set it to trigger on assets with the tag **`moderation-queue`**. This tag is the key that connects our Next.js app to this specific workflow.

### 2. The Guard: AI Content Moderation

Next, we add our automated safety check.

- **Block**: `Amazon Rekognition Moderation`
- **Configuration**: For a kid-safe platform, we need to be strict. Set the **confidence level** to a low value like `0.3` (30%) and add sensitive categories like `Suggestive`, `Explicit Nudity`, `Violence`, and `Visually Disturbing`.

### 3. The Fork in the Road: Conditional Logic

The moderation block gives us a result: `approved` or `rejected`. We need to create two different paths based on this outcome.

- **Block**: `If Condition`
- **Configuration**: Set it to check if the `moderation_status` from the previous step **equals** `rejected`. This creates a "True" path for unsafe images and a "False" path for safe ones.

### 4. The Quarantine: Handling Rejected Images

On the **"True"** path (if an image is rejected), we simply tag it for manual review and stop.

- **Block**: `Update Tags`
- **Configuration**: Set the action to **Add** the tag **`unsafe-content`**.

### 5. The Enhancement Factory: Processing Approved Images

On the **"False"** path, we'll run our approved images through a two-step enhancement process.

1. **Privacy First**: Add an `Edit Media` block and configure it to apply the **`blur_faces`** effect.
2. **Kid-Friendly Fun**: Add a second `Edit Media` block that takes the output from the first and applies the **`cartoonify`** effect.

### 6. The Final Stamp: Tagging the Processed Asset

Finally, we need to add a tag confirming that the image has passed our entire pipeline.

- **Block**: `Update Tags`
- **Configuration**: Add the tag **`safe-and-processed`** to the final, transformed image.

After connecting all the blocks, your completed MediaFlow should look like this. **Don't forget to Save and Enable the flow!**

![](https://res.cloudinary.com/hackit-africa/image/upload/v1761241405/kid-safe-platform/Mediaflow.png)

With our automated backend now live, let's connect it to our Next.js application.

### Step 3: Integrating the Cloudinary Uploader in Next.js

Now that the automated pipeline is ready in the cloud, it’s time to connect your browser to your backend.

We’ll use [`next-cloudinary`](https://www.npmjs.com/package/next-cloudinary) to add a pre-built upload widget to the app.

### 1. Configure Your Environment

Create a file named `.env.local` in your project root and add your Cloudinary credentials.

You can find these on your Cloudinary Dashboard.

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

You also need an **Unsigned Upload Preset** from your Cloudinary settings.

Set the **Folder** to `kid-safe-platform` for better organization.

### 2. Build the Uploader Component

Create a new file at [`components/Uploader.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/components/Uploader.tsx).

This will handle the upload logic on the client side.

Install the package:

```bash
npm install next-cloudinary
```

Now, add the upload button code:

```tsx
"use client";

import { CldUploadButton } from "next-cloudinary";

export default function Uploader() {
  return (
    <CldUploadButton
      uploadPreset="your_upload_preset_name"
      options={{ tags: ["moderation-queue"] }} // Triggers the MediaFlow
      onSuccess={(result) => {
        console.log("Upload successful!", result);
      }}
    >
      {/* Your custom button UI goes here */}
    </CldUploadButton>
  );
}
```

Next, import and place `<Uploader />` inside the `<CardContent>` section of

[`app/page.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/page.tsx).

Run the app. When you upload an image, it will trigger the full moderation and enhancement pipeline you built in MediaFlows.

You won’t see the results yet, but the backend process is active.

**See the full code on GitHub:**

- [Uploader component](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/components/Uploader.tsx)
- [Main page layout](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/page.tsx)

### Step 4: Creating a Secure API to Verify Moderation

Your frontend can upload an image, but it doesn’t know what your MediaFlow decides.

Showing an image before it’s approved is risky, since unsafe content could appear to users.

We’ll fix this by adding a secure API route that checks the final moderation result directly from Cloudinary.

### 1. Create the API Route

In your `app` directory, create a new file named

[`app/api/check-status/route.ts`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/api/check-status/route.ts).

This server-side endpoint will use the Cloudinary **Admin API** to securely check moderation status.

### 2. Implement the Polling Logic

Inside `route.ts`, add a `POST` function that accepts a `public_id`.

This function polls Cloudinary every few seconds until a final moderation tag appears.

The loop ensures your app waits for the MediaFlow decision before showing the image.

```tsx
// In app/api/check-status/route.ts
import { v2 as cloudinary } from "cloudinary";

// Configure with your server-side API key and secret
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { public_id } = await request.json();

  // Poll Cloudinary up to 7 times
  for (let i = 0; i < 7; i++) {
    const resource = await cloudinary.api.resource(public_id);
    const tags = resource.tags || [];

    if (tags.includes("safe-and-processed")) {
      return Response.json({ status: "approved" });
    }
    if (tags.includes("unsafe-content")) {
      return Response.json({ status: "rejected" });
    }

    // Wait 3 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  // Time out after ~21 seconds
  return Response.json({ status: "timeout" }, { status: 408 });
}
```

This endpoint acts as a **secure verifier**.

It keeps the browser from guessing moderation results and ensures only approved images are displayed.

**See the full code on GitHub:**

- [API Route: check-status](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/api/check-status/route.ts)

### Step 5: Building a Dynamic and Honest Frontend

Now that you have a secure API to verify moderation status, it’s time to connect it to the frontend.

We’ll turn the uploader into an honest one that reflects the true image status, creating a safer user experience.

### 1. Manage UI States

We need to track the image’s journey.

Instead of just showing a preview, the UI will now have clear states:

`processing`, `approved`, `rejected`, and `error`.

Use a `useState` hook in the [`components/Uploader.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/components/Uploader.tsx) component.

```tsx
"use client";
import { useState } from "react";

type UploadStatus = "idle" | "processing" | "approved" | "rejected" | "error";

export default function Uploader() {
  const [status, setStatus] = useState < UploadStatus > "idle";
  // ...
}
```

### 2. Call the Verification API

Create a function that calls the `/api/check-status` endpoint.

This sends the `public_id` of the uploaded image and waits for the final verdict.

```tsx
const checkModerationStatus = async (publicId: string) => {
  setStatus("processing");
  try {
    const response = await fetch("/api/check-status", {
      method: "POST",
      body: JSON.stringify({ public_id: publicId }),
    });

    const data = await response.json();
    setStatus(data.status); // 'approved' or 'rejected'
  } catch (error) {
    setStatus("error");
  }
};
```

Trigger this function from the `onSuccess` callback of `<CldUploadButton />`.

It starts verification as soon as the upload finishes.

### 3. Render the UI Conditionally

Render different UI elements based on `status`.

A `switch` statement makes it clear and simple.

Show a loading message while processing, the cartoonified image when approved, or a clear rejection message if unsafe.

```tsx
const renderStatusMessage = () => {
  switch (status) {
    case 'processing':
      return <p>Analyzing for Safety...</p>;
    case 'approved':
      return <CldImage src={...} effects={[...]} />; // Final safe image
    case 'rejected':
      return <div className="text-red-600">Upload Rejected.</div>;
    default:
      return null;
  }
};

return (
  <div>
    <CldUploadButton onSuccess={...} />
    <div className="mt-8">{renderStatusMessage()}</div>
  </div>
);

```

Your app now provides a truthful, secure experience.

It waits for the backend’s verdict before showing any content, ensuring unsafe images never appear.

**See the full code on GitHub:**

- [Uploader component](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/components/Uploader.tsx)
- [API Route](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/api/check-status/route.ts)

### Step 6: Displaying the Curated Content

A moderation pipeline is only useful if it displays approved content.

In this step, we’ll create a gallery page that shows only images marked safe by MediaFlow.

We’ll use a **Next.js Server Component** for secure and efficient rendering.

The server will fetch approved images from Cloudinary before sending the page to the browser.

### 1. Create the Server-Side Gallery Page

Create a new file at

[`app/gallery/page.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/gallery/page.tsx).

This component connects securely to Cloudinary using your secret credentials, which stay safe on the server.

We’ll use a search expression that filters for images inside the `kid-safe-platform` folder **and** tagged with `safe-and-processed`.

This ensures that only approved images appear in the gallery.

```tsx
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary securely
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function GalleryPage() {
  const searchResult = await cloudinary.search
    .expression("folder=kid-safe-platform AND tags=safe-and-processed")
    .sort_by("created_at", "desc")
    .execute();

  return <GalleryGrid resources={searchResult.resources} />;
}
```

### 2. Build the Client-Side Display Grid

Create a new file at

[`app/gallery/GalleryGrid.tsx`](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/gallery/GalleryGrid.tsx).

This component receives the list of approved images from the server and displays them in a responsive grid.

```tsx
"use client";

import { CldImage } from "next-cloudinary";

export default function GalleryGrid({ resources }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <CldImage
          key={resource.public_id}
          src={resource.public_id}
          alt="An approved and moderated image"
          effects={[{ blurFaces: true }, { cartoonify: true }]}
        />
      ))}
    </div>
  );
}
```

This split between **server fetching** and **client rendering** is a best practice in modern Next.js apps.

It keeps your API keys safe while giving users a fast and secure gallery experience.

**See the full code on GitHub:**

- [Gallery Page](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/gallery/page.tsx)
- [Gallery Grid Component](https://github.com/musebe/kidsafe-uploader-with-mediaflows/blob/main/app/gallery/GalleryGrid.tsx)

### Conclusion & Next Steps

And there you have it! In just a few steps, we've built a robust, fully automated content moderation pipeline. We've combined the power of a modern web framework, **Next.js**, with the simplicity of a visual workflow builder, **Cloudinary MediaFlows**, to create a platform that is not just functional but genuinely safe for its users.

We successfully built a system that:

- **Automates** safety checks, privacy enhancements, and kid-friendly effects.
- **Verifies** the true moderation status securely on the backend before displaying content.
- **Curates** a gallery of only approved images, ensuring a completely safe viewing experience.

This project is a powerful testament to how modern, decoupled architecture can solve complex problems like content moderation in an elegant and scalable way.

### Where to Go From Here?

This application is a fantastic foundation, but you can take it even further. Here are a few ideas:

- **Switch to Webhooks**: Our API uses polling to check for status updates. For a more efficient, real-time solution, you could modify the MediaFlow to send a **webhook** to your API route upon completion, eliminating the need for repeated checks.
- **Build a Manual Review Dashboard**: Create a private, admin-only page that fetches all images with the `unsafe-content` tag. This would give human moderators a dedicated queue to review and re-classify flagged content.
- **Add More Complex Logic**: Expand your MediaFlow to include other features, like adding a "safe" watermark to approved images or applying different effects based on AI-detected categories.

Happy building!