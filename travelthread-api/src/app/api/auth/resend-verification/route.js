import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRandomToken, hashToken } from '@/lib/hash';
import { sendVerificationEmail } from '@/lib/resend';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Delete any existing email verification tokens for the user
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION'
      }
    });

    const verifyTokenRaw = generateRandomToken();
    const tokenHash = hashToken(verifyTokenRaw);

    await prisma.verificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    await sendVerificationEmail(email, verifyTokenRaw);

    return NextResponse.json({ message: 'Check your inbox' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
