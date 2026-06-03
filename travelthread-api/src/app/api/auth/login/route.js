import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateRandomToken, hashToken } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email', code: 'EMAIL_NOT_VERIFIED' }, { status: 403 });
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshTokenRaw = signRefreshToken(user.id);
    const tokenHash = hashToken(refreshTokenRaw);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
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