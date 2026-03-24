import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, sourcePage } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone: phone || null,
        message: message || null,
        source_page: sourcePage || null,
        lead_source: 'website',
      });

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit' },
        { status: 500 }
      );
    }

    // Send notification email to admin (non-blocking)
    if (process.env.RESEND_API_KEY) {
      fetch(`${request.nextUrl.origin}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'trevorsdesignventures@gmail.com',
          subject: `New Lead: ${name}`,
          html: `
            <h2>New Lead from CORE Framework Website</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            <p><strong>Source:</strong> ${sourcePage || 'Unknown'}</p>
          `,
        }),
      }).catch((err) => console.error('Lead notification email failed:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
