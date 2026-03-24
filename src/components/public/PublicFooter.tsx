import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-sidebar-bg text-sidebar-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-white tracking-tight">CORE</span>
                <span className="text-sidebar-text/70 text-xs font-semibold tracking-widest uppercase">Framework</span>
              </div>
            </div>
            <p className="text-sm text-sidebar-text/70 leading-relaxed">
              All-in-one construction project management for builders, architects, and contractors.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-sidebar-text/70">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Built For</h3>
            <ul className="space-y-2 text-sm text-sidebar-text/70">
              <li>General Contractors</li>
              <li>Custom Home Builders</li>
              <li>Architects</li>
              <li>Property Owners</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-sidebar-text/70">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Client Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-text/50">
            &copy; {new Date().getFullYear()} CORE Framework. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-sidebar-text/50">
            <Link href="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
