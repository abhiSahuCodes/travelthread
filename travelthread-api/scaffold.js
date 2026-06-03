const fs = require('fs');
const path = require('path');

const endpoints = {
  'auth/register/route.js': `
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateRandomToken, hashToken } from '@/lib/hash';
import { sendVerificationEmail } from '@/lib/resend';

export async function POST(req) {
  try {
    const { name, email, homeCountry, password } = await req.json();
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        homeCountry,
        passwordHash: hashedPassword,
      }
    });

    const verifyTokenRaw = generateRandomToken();
    const tokenHash = hashToken(verifyTokenRaw);
    
    await prisma.verificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    await sendVerificationEmail(email, verifyTokenRaw);

    return NextResponse.json({ message: 'Check your inbox' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}`,

  'auth/login/route.js': `
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
}`,

  'auth/refresh/route.js': `
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
}`,

  'health/route.js': `
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'ok', ts: new Date().toISOString() });
}`,

  'upload/image/route.js': `
import { NextResponse } from 'next/server';
import { getSignedUploadParams } from '@/lib/cloudinary';

export async function POST(req) {
  const folder = 'travelthread/images';
  const params = getSignedUploadParams(folder);
  return NextResponse.json(params, { status: 200 });
}`
};

const basePath = path.join(__dirname, 'src', 'app', 'api');

for (const [route, code] of Object.entries(endpoints)) {
  const fullPath = path.join(basePath, route);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, code.trim());
}
console.log('Endpoints scaffolded successfully.');
