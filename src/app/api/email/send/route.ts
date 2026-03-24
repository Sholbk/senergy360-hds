import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, attachments } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    const resend = getResend();
    const toArray = Array.isArray(to) ? to : [to];

    const { data, error } = await resend.emails.send({
      from: 'CORE Framework <noreply@coreframework.app>',
      to: toArray,
      subject,
      html,
      attachments: attachments || undefined,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Email API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
