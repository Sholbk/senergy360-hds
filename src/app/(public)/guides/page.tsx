import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Guides — SENERGY360 Healthy Home Resources',
  description: 'Download free guides on healthy home design, building science, non-toxic materials, and the SENERGY360 Healthy Design Specifications framework.',
};

const GUIDES = [
  {
    title: 'Introduction to Healthy Home Design',
    description:
      'Learn the fundamentals of designing a home that prioritizes occupant health — from material selection to air quality and moisture management.',
    category: 'Getting Started',
  },
  {
    title: 'The 12 Core Principles of Healthy Design',
    description:
      'A comprehensive overview of the SENERGY360 Healthy Design Specifications framework and how each principle contributes to a healthier living environment.',
    category: 'HDS Framework',
  },
  {
    title: 'Non-Toxic Building Materials Guide',
    description:
      'Navigate the world of low-VOC, formaldehyde-free, and chemical-safe materials for every phase of construction — from foundation to finish.',
    category: 'Materials',
  },
  {
    title: 'Low-EMF Electrical Design',
    description:
      'Understand how electrical systems impact occupant health and learn strategies for reducing electromagnetic field exposure in residential construction.',
    category: 'Electrical',
  },
  {
    title: 'Advanced Climate Control & Ventilation',
    description:
      'Best practices for HVAC design, ERV/HRV systems, filtration, and indoor air quality management in high-performance healthy homes.',
    category: 'HVAC & IAQ',
  },
  {
    title: 'Water Quality & Filtration Systems',
    description:
      'A guide to whole-home water filtration, structured water systems, and plumbing strategies that support long-term health and wellness.',
    category: 'Water',
  },
  {
    title: 'Mold Prevention & Non-Toxic Cleaning',
    description:
      'Proven strategies for preventing mold during and after construction, plus safe cleaning approaches that avoid toxic chemical residues.',
    category: 'Maintenance',
  },
  {
    title: 'Circadian Lighting Design',
    description:
      'How to design lighting systems that support your natural circadian rhythm — from spectrum selection to automated scheduling and controls.',
    category: 'Lighting',
  },
];

export default function GuidesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Guides &amp; Resources
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Free educational resources to help you understand healthy home design, non-toxic building materials, and the science behind every SENERGY360 project.
            </p>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Healthy Home Knowledge Base
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Each guide is designed to give homeowners, architects, and builders the knowledge they need to make informed decisions about healthy construction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUIDES.map((guide, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <span className="text-xs font-medium text-primary bg-primary-bg border border-primary/20 rounded-full px-3 py-1 w-fit mb-4">
                  {guide.category}
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed flex-1">
                  {guide.description}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-sm text-primary font-medium">
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">
            Want Personalized Guidance?
          </h2>
          <p className="text-muted mb-8 max-w-2xl mx-auto">
            Every project is unique. Contact us for a consultation and we&apos;ll help you understand how the Healthy Design Specifications apply to your home.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadCaptureForm sourcePage="guides" />
        </div>
      </section>
    </div>
  );
}
