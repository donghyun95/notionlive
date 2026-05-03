import { NextResponse } from 'next/server';
import { createPresignedUploadUrl } from './presignedURL';
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { message: 'filename, contentType are required' },
        { status: 400 },
      );
    }
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 },
      );
    }

    const result = await createPresignedUploadUrl({
      filename,
      contentType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create presigned URL:', error);

    return NextResponse.json(
      { message: 'Failed to create presigned URL' },
      { status: 500 },
    );
  }
}
