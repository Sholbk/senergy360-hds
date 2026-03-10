import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-sidebar-bg text-sidebar-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-semibold text-white tracking-wide">SENERGY360</span>
            </div>
            <p className="text-sm text-sidebar-text/70 leading-relaxed">
              Full-service healthy home design, architecture, and construction.
              Designing and building the healthiest homes in the world.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-sidebar-text/70">
              <li><Link href="/services" className="hover:text-primary transition-colors">Architectural Design</Link></li>
              <li><Link href="/faswall" className="hover:text-primary transition-colors">FASWALL Construction</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Building Science Consulting</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Healthy Home Assessments</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Learn</h3>
            <ul className="space-y-2 text-sm text-sidebar-text/70">
              <li><Link href="/core-framework" className="hover:text-primary transition-colors">CORE Framework</Link></li>
              <li><Link href="/why-healthy-homes" className="hover:text-primary transition-colors">Why Healthy Homes</Link></li>
              <li><Link href="/building-process" className="hover:text-primary transition-colors">Our Process</Link></li>
              <li><Link href="/building-envelope" className="hover:text-primary transition-colors">Building Envelope</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-sidebar-text/70">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Get in Touch</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Client Portal</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-text/50">
            &copy; {new Date().getFullYear()} SENERGY360. All rights reserved.
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
