import { NextRequest, NextResponse } from 'next/server';
import { getStripe, formatCents } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    // Fetch invoice with line items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, invoice_line_items(*), clients(primary_first_name, primary_last_name, primary_email)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    const stripe = getStripe();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: (invoice.invoice_line_items || []).map((item: { description: string; quantity: number; unit_price_cents: number }) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.description,
          },
          unit_amount: item.unit_price_cents,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/invoices/${invoiceId}?payment=success`,
      cancel_url: `${request.nextUrl.origin}/invoices/${invoiceId}?payment=cancelled`,
      metadata: {
        invoice_id: invoiceId,
      },
      customer_email: (invoice.clients as { primary_email?: string })?.primary_email || undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
