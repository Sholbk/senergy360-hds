import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

const FEATURES = [
  {
    title: 'Project Dashboard',
    desc: 'Track every project from pre-construction to closeout. Real-time status, team activity, and key metrics at a glance.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Document Portal',
    desc: 'Upload plans, specs, and contracts. Control access by role. Collect digital signatures — all in one secure location.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Team Collaboration',
    desc: 'Real-time activity feed, comments, and updates. Keep your GC, subs, architect, and owner on the same page.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Scheduling & Calendar',
    desc: 'Milestones, deadlines, inspections, and meetings. Sync with your workflow so nothing falls through the cracks.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Invoicing & Payments',
    desc: 'Create invoices, track payments, and manage project financials. Integrated with Stripe for seamless transactions.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: 'Checklists & Inspections',
    desc: 'Standardize quality control with customizable checklists. Track completion across every phase of the build.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    title: 'Reports & PDFs',
    desc: 'Generate professional project reports and specifications. Send branded PDFs directly to clients and contractors.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
  },
  {
    title: "Owner's Manual",
    desc: 'Deliver a complete project manual to your clients at closeout — maintenance schedules, warranties, and specs in one place.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
];

const PAIN_POINTS = [
  { title: 'Scattered Documents', desc: 'Plans in email, specs in Dropbox, contracts in a drawer. Nothing is in one place.' },
  { title: 'Missed Deadlines', desc: 'No single source of truth for schedules. Things slip and nobody knows until it\'s too late.' },
  { title: 'Poor Communication', desc: 'Owners, architects, and subs are all on different pages. Updates get lost in text threads.' },
  { title: 'No Visibility', desc: 'You can\'t see project status at a glance. Reporting is manual and always out of date.' },
];

const PERSONAS = [
  { title: 'General Contractors', desc: 'Coordinate subs, manage timelines, and keep clients informed — without the chaos.' },
  { title: 'Custom Home Builders', desc: 'From specs to closeout, manage every detail of high-end residential builds.' },
  { title: 'Architects', desc: 'Collaborate with builders, share documents, and track design changes in real time.' },
  { title: 'Property Owners', desc: 'See your project\'s progress, review documents, and communicate with your team — all in one place.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sidebar-bg via-[#1e293b] to-[#0f172a]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Construction Project Management,{' '}
              <span className="text-primary">Simplified</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              One platform for your entire build — documents, schedules, invoicing, team collaboration, and client reporting. Built for builders who want to spend less time managing tools and more time building.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-base"
              >
                Start Free Trial
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-base border border-white/20"
              >
                See Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Managing construction projects shouldn&apos;t mean juggling 10 different tools
            </h2>
            <p className="mt-4 text-muted text-lg">
              Spreadsheets, email chains, shared drives, text messages — sound familiar?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAIN_POINTS.map((point) => (
              <div
                key={point.title}
                className="p-6 bg-white rounded-xl border border-border hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{point.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-primary-bg/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything you need to run your builds
            </h2>
            <p className="mt-4 text-muted text-lg">
              CORE Framework replaces the patchwork of tools with one integrated platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-white rounded-xl border border-border hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-muted text-lg">
              No complex setup. No training required. Just start building.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create a Project', desc: 'Add your project details, address, and type. Set up your build in under a minute.' },
              { step: '02', title: 'Invite Your Team', desc: 'Add your architect, GC, subs, and owner. Everyone gets role-based access to what they need.' },
              { step: '03', title: 'Manage Everything', desc: 'Documents, schedules, invoices, checklists, reports — all in one place. No more context-switching.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-primary-bg/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Built for the people who build
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERSONAS.map((persona) => (
              <div
                key={persona.title}
                className="p-6 bg-white rounded-xl border border-border text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{persona.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted text-sm font-medium tracking-wide uppercase mb-6">Trusted by builders and contractors</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['Builder Co.', 'Apex Homes', 'Summit Construction', 'Ridgeline Builders', 'Ironwood GC'].map((name) => (
              <span key={name} className="text-xl font-bold text-foreground/60 tracking-wide">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Lead Capture */}
      <section className="py-20 bg-sidebar-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to streamline your next project?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Get started with CORE Framework today. No credit card required.
          </p>
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/10">
            <LeadCaptureForm sourcePage="homepage" compact />
          </div>
        </div>
      </section>
    </div>
  );
}
