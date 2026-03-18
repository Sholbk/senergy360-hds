import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Media — SENERGY360 News, Videos & Press',
  description: 'Stay up to date with SENERGY360 news, project showcases, video walkthroughs, and press coverage about healthy home design and construction.',
};

const FEATURED_TOPICS = [
  {
    title: 'The Science Behind Healthy Homes',
    description:
      'How building science, material chemistry, and environmental design converge to create homes that actively support human health.',
    type: 'Article',
  },
  {
    title: 'FASWALL ICF Construction',
    description:
      'An in-depth look at the mineralized wood-chip and cement ICF system that provides superior thermal performance and indoor air quality.',
    type: 'Video',
  },
  {
    title: 'Low-EMF Electrical Systems Explained',
    description:
      'Why electromagnetic field reduction matters in residential design and how SENERGY360 approaches low-EMF wiring strategies.',
    type: 'Article',
  },
];

const PRESS = [
  {
    title: 'Healthy Home Construction: A Growing Movement',
    source: 'Building Science Today',
    description: 'How firms like SENERGY360 are leading the shift toward health-first residential construction.',
  },
  {
    title: 'Non-Toxic Materials Are Changing the Industry',
    source: 'Green Building Magazine',
    description: 'The expanding market for formaldehyde-free, low-VOC, and chemical-safe building products.',
  },
  {
    title: 'Circadian Lighting: The Next Frontier',
    source: 'Architectural Wellness Journal',
    description: 'How lighting design that follows natural daylight patterns improves sleep, mood, and overall wellness.',
  },
];

export default function MediaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Media &amp; News
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Project showcases, educational content, industry news, and press coverage from SENERGY360.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Featured Content
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Videos, articles, and educational content about healthy home design and the SENERGY360 approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_TOPICS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Placeholder thumbnail */}
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  {item.type === 'Video' ? (
                    <svg className="w-16 h-16 text-primary/30" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-16 h-16 text-primary/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-medium text-accent mb-2">{item.type}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">
                    {item.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-sm text-primary font-medium">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press & Coverage */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Press &amp; Coverage
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Industry coverage and thought leadership in healthy home design and construction.
            </p>
          </div>

          <div className="space-y-4">
            {PRESS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-border p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap bg-background border border-border rounded-full px-3 py-1 flex-shrink-0">
                    {item.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">
            Stay Connected
          </h2>
          <p className="text-muted mb-8 max-w-2xl mx-auto">
            Get in touch to learn more about our projects, request media assets, or discuss healthy home design.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadCaptureForm sourcePage="media" />
        </div>
      </section>
    </div>
  );
}
