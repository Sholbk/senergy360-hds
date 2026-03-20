'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/core-framework', label: 'CORE Framework' },
  {
    href: '/services',
    label: 'Services',
    children: [
      { href: '/services/design-build', label: 'Design + Build with FASWALL' },
      { href: '/services/owners-representation', label: "Owner's Representation + Project Management" },
      { href: '/services/assessments', label: 'Healthy Home Assessments + Build-Back' },
    ],
  },
  { href: '/contact', label: 'Contact' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SENERGY360" width={40} height={40} className="w-10 h-10" />
            <span className="text-foreground font-semibold text-lg tracking-wide">SENERGY360</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'px-3 py-2 text-sm rounded-md transition-colors inline-flex items-center gap-1',
                      pathname === link.href || pathname.startsWith('/services')
                        ? 'text-primary font-medium'
                        : 'text-foreground/70 hover:text-foreground hover:bg-primary-bg'
                    )}
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-0 w-72 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-primary-bg transition-colors font-medium"
                      >
                        All Services
                      </Link>
                      <div className="border-t border-border my-1" />
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block px-4 py-2 text-sm transition-colors',
                            pathname === child.href
                              ? 'text-primary font-medium bg-primary-bg'
                              : 'text-foreground/70 hover:text-foreground hover:bg-primary-bg'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
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
              )
            )}
            <Link
              href="/login"
              className="ml-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Login
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground"
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
          <nav className="lg:hidden py-4 border-t border-border space-y-1">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => { if (!link.children) setMobileOpen(false); }}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-md transition-colors',
                    pathname === link.href
                      ? 'text-primary font-medium bg-primary-bg'
                      : 'text-foreground/70 hover:text-foreground hover:bg-primary-bg'
                  )}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="pl-4 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-md transition-colors',
                          pathname === child.href
                            ? 'text-primary font-medium bg-primary-bg'
                            : 'text-foreground/60 hover:text-foreground hover:bg-primary-bg'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
