'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/contact', label: 'Contact' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground font-bold text-lg tracking-tight">CORE</span>
              <span className="text-muted text-xs font-semibold tracking-widest uppercase">Framework</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm rounded-md transition-colors',
                  pathname === link.href
                    ? 'text-primary font-medium'
                    : 'text-foreground/70 hover:text-foreground hover:bg-primary-bg'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
            >
              Login
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-border space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2 text-sm rounded-md transition-colors',
                  pathname === link.href
                    ? 'text-primary font-medium bg-primary-bg'
                    : 'text-foreground/70 hover:text-foreground hover:bg-primary-bg'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-primary font-medium"
            >
              Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
