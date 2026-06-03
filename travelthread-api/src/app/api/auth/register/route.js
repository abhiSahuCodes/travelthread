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
}