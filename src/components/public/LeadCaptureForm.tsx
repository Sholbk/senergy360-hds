'use client';

import { useState } from 'react';

interface LeadCaptureFormProps {
  sourcePage: string;
  compact?: boolean;
}

export default function LeadCaptureForm({ sourcePage, compact = false }: LeadCaptureFormProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage }),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-green-700 font-medium">Thank you for reaching out!</p>
        <p className="text-green-600 text-sm mt-1">We&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          maxLength={100}
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          maxLength={254}
          className={inputClass}
        />
      </div>
      <input
        type="tel"
        placeholder="Phone Number (optional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        maxLength={20}
        className={inputClass}
      />
      {!compact && (
        <textarea
          placeholder="Tell us about your project..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          maxLength={2000}
          className={inputClass}
        />
      )}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-50 text-sm"
      >
        {submitting ? 'Sending...' : 'Get Started'}
      </button>
    </form>
  );
}
