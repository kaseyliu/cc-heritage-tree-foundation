# Getting Started

This guide covers local setup, required environment variables, and common troubleshooting for this project.

## Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [AWS S3 Setup](#aws-s3-setup)
- [Helpful Commands](#helpful-commands)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas project/cluster
- Clerk application (publishable key + secret key)
- AWS account with 3 S3 buckets for:
  - tree photos
  - profile pictures
  - message attachments

## Local Setup

1. Clone the repository.
   - `git clone <repo-url>`
2. Install dependencies.
   - `npm install`
3. Create `.env.local` in the project root and populate required keys.
4. Start development server.
   - `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with values from your tech lead:

```bash
MONGO_URI=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/signupredirect

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_S3_PROFILE_PIC_BUCKET_NAME=
AWS_S3_MESSAGES_ATTACHMENT_BUCKET_NAME=
```

Notes:

- Use `MONGO_URI` (this is the variable used by the shared DB connector).
- Do not commit `.env.local`.

## AWS S3 Setup

The app uploads files and reads them back by URL.

Required bucket behavior:

- App IAM user must have `s3:PutObject` and `s3:GetObject` on all 3 buckets.
- If files should be visible directly in browser by URL, bucket policies must allow `s3:GetObject`.
- Bucket "Block Public Access" settings must not override your public-read policy.

## Helpful Commands

- `npm run dev`: Start local dev server
- `npm run build`: Production build + type/lint checks
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Auto-fix lintable issues
- `npm test`: Run tests
- `git stash`: Temporarily store local changes
- `git stash apply`: Reapply latest stash
- `git merge origin/main`: Merge latest main into current branch

## Project Structure

- [**.github**](/.github): CI/CD and issue/PR templates
- [**docs**](/docs): Documentation
- [**public**](/public): Static assets
- [**src**](/src): Application code
  - [**app**](/src/app/): App routes and API routes
    - [**api**](/src/app/api): Route handlers
    - [**\***](/src/app/): App pages
  - [**components**](/src/components): Shared UI components
  - [**database**](/src/database): Mongoose schemas and DB connector
