import { NextResponse } from 'next/server';
import { getSignedUploadParams } from '@/lib/cloudinary';

export async function POST(req) {
  const folder = 'travelthread/images';
  const params = getSignedUploadParams(folder);
  return NextResponse.json(params, { status: 200 });
}