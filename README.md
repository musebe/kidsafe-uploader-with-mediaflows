
# Kid-Safe Media Platform with Next.js and Cloudinary MediaFlows

A full-stack example of an automated, kid-safe content pipeline using **Next.js** and **Cloudinary MediaFlows**.  
Users upload images that are scanned, blurred, enhanced, and shown only if approved.

## Features

- **Secure Uploads**: Upload directly from the browser with Cloudinary Upload Widget.  
- **Auto Moderation**: Cloudinary MediaFlow uses AWS Rekognition to detect unsafe content.  
- **Privacy Filter**: Blurs all faces before approval.  
- **Kid-Friendly Effect**: Adds a cartoon-style filter.  
- **Real-Time Status**: Next.js polls Cloudinary for moderation results.  
- **Safe Gallery**: Displays only approved images.

## Tech Stack

- **Framework**: Next.js (App Router)  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  
- **UI Components**: shadcn/ui  
- **Media Backend**: Cloudinary  
  - Upload Widget  
  - MediaFlows (workflow automation)  
  - Admin API (server-side moderation checks)

## Getting Started

### 1. Prerequisites

- Node.js v18 or newer  
- A free Cloudinary account

### 2. Installation

```bash
git clone <your-repo-url>
cd kid-safe-platform
npm install
````

### 3. Cloudinary Setup

1. Get your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.
2. Create an **Upload Preset**:

   * Go to **Settings > Upload**
   * Add a new preset
   * Set **Signing Mode** to *Unsigned*
   * Set the **Folder** to `kid-safe-platform`

### 4. Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

Add your unsigned upload preset name as used in the uploader component.

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).


## Cloudinary MediaFlows Setup
![MediaFlow Setup Diagram](/public/mediaflow.png)

### Easy Setup (AI Prompt)

In **MediaFlows**, create a new flow and paste this prompt:

> When a file is uploaded with the tag 'moderation-queue', moderate it using AWS Rekognition.
> If 'rejected', tag it 'unsafe-content'.
> Otherwise, blur faces, apply 'cartoonify', and tag it 'safe-and-processed'.

### Manual Setup

1. **Trigger**: File Upload (tag = `moderation-queue`)
2. **Moderation**: AWS Rekognition (confidence 0.3)
3. **Condition**: If `rekognition.moderation_status == rejected`
4. **If True**: Tag as `unsafe-content`
5. **If False**:

   * Apply `blur_faces`
   * Apply `cartoonify`
   * Tag as `safe-and-processed`
6. **Enable the flow**

## How It Works

1. **Upload**: User uploads with tag `moderation-queue`.
2. **Trigger**: MediaFlow starts moderation.
3. **Poll**: API checks image status via Cloudinary Admin API.
4. **Approve/Reject**: Tags image as `safe-and-processed` or `unsafe-content`.
5. **UI Update**: Frontend updates based on final status.
6. **Gallery**: Displays only approved images.


## License

MIT © [Eugene Musebe]
