import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken, generateRandomToken } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) return NextResponse.json({ error: 'No token' }, { status: 401 });

    const tokenHash = hashToken(refreshToken);
    
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    const newAccessToken = signAccessToken({ sub: tokenRecord.user.id, email: tokenRecord.user.email });
    const newRefreshTokenRaw = signRefreshToken(tokenRecord.user.id);
    const newTokenHash = hashToken(newRefreshTokenRaw);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: tokenRecord.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenRaw
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}