import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyGoogleIdToken } from '@/lib/google';
import { hashToken } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const payload = await verifyGoogleIdToken(idToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { googleId }
    });

    if (!user) {
      // Check if user exists with the same email (account linking)
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // Link the Google account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            profilePicture: user.profilePicture || picture,
            // If email is not yet verified, mark it as verified now since Google verified it
            emailVerified: user.emailVerified || new Date()
          }
        });
      } else {
        // Create new user (homeCountry is required, so we default to 'US' or 'Unknown')
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            googleId,
            profilePicture: picture,
            homeCountry: 'US', // default fallback
            emailVerified: new Date()
          }
        });
      }
    }

    // Generate tokens
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
