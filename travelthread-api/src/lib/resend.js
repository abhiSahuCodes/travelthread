import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email, token) {
  const verifyLink = `travelthread://verify?token=${token}`;
  await resend.emails.send({
    from: 'TravelThread <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email address',
    html: `<p>Welcome to TravelThread! Click <a href="${verifyLink}">here</a> to verify your email.</p>`,
  });
}

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `travelthread://reset-password?token=${token}`;
  await resend.emails.send({
    from: 'TravelThread <support@resend.dev>',
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
}
