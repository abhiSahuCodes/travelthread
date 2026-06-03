import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const tokenHash = hashToken(token);

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.type !== 'EMAIL_VERIFICATION' || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    // Mark email as verified and delete token in transaction
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: new Date() }
      }),
      prisma.verificationToken.delete({
        where: { id: tokenRecord.id }
      })
    ]);

    // Issue auth tokens directly so user is logged in
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshTokenRaw = signRefreshToken(user.id);
    const newRefreshTokenHash = hashToken(refreshTokenRaw);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newRefreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({
      accessToken,
      refreshToken: refreshTokenRaw,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        homeCountry: user.homeCountry,
        profilePicture: user.profilePicture
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
