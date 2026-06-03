import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/hash';

export async function POST(req) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const tokenHash = hashToken(refreshToken);

    // Delete token if it exists (ignore error if it doesn't exist)
    try {
      await prisma.refreshToken.delete({
        where: { tokenHash }
      });
    } catch (e) {
      // Record already deleted or didn't exist
    }

    return NextResponse.json({ message: 'Logged out' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
