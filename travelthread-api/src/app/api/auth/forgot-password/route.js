import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRandomToken, hashToken } from '@/lib/hash';
import { sendPasswordResetEmail } from '@/lib/resend';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success even if user not found to prevent email harvesting
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent' }, { status: 200 });
    }

    const resetTokenRaw = generateRandomToken();
    const tokenHash = hashToken(resetTokenRaw);

    await prisma.verificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
      }
    });

    await sendPasswordResetEmail(email, resetTokenRaw);

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
