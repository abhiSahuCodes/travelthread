import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken, hashPassword } from '@/lib/hash';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    const tokenHash = hashToken(token);

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.type !== 'PASSWORD_RESET' || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Reset link expired' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: hashedPassword }
      }),
      // Delete used verification token
      prisma.verificationToken.delete({
        where: { id: tokenRecord.id }
      }),
      // Invalidate all active sessions/refresh tokens for this user
      prisma.refreshToken.deleteMany({
        where: { userId: tokenRecord.userId }
      })
    ]);

    return NextResponse.json({ message: 'Password updated' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
