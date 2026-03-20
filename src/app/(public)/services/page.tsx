import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Services — SENERGY360 Healthy Home Design & Construction',
  description: 'SENERGY360 provides three core services: Design + Build with FASWALL, Owner\'s Representation + Project Management, and Healthy Home Assessments + Build-Back.',
};

const SERVICES = [
  {
    num: 1,
    title: 'Design + Build with FASWALL',
    subtitle: 'High-performance healthy homes designed from the structure outward',
    description:
      'SENERGY360 offers architectural design and construction services for homes built with FASWALL mineral-based insulated concrete form systems. Our team includes a licensed AIA architect within SENERGY360, allowing architecture, building science, and construction strategy to be integrated from the beginning.',
    href: '/services/design-build',
    coreSystems: [
      'Building Science & Performance Enclosure',
      'Healthy Building Materials & Finish Systems',
      'Climate Control & Ventilation',
      'Plumbing Design',
      'Solar & Alternative Power Systems',
    ],
  },
  {
    num: 2,
    title: "Owner's Representation + Project Management",
    subtitle: "Protecting the client's investment and guiding the project team",
    description:
      'Not every client needs SENERGY360 to fully design and build the home. Some already have an architect, contractor, or partial team in place, but want an experienced healthy-building expert to help guide the process. SENERGY360 works on behalf of the client to coordinate the project team, review major decisions, and keep the home aligned with the original goals.',
    href: '/services/owners-representation',
    coreSystems: [
      'Electrical Systems (Low-EMF Design)',
      'Circadian Lighting Systems',
      'Low-Voltage & Smart Integration Systems',
      'Water Quality & Advanced Filtration',
      'Mold Prevention & Non-Toxic Cleaning',
    ],
  },
  {
    num: 3,
    title: 'Healthy Home Assessments + Build-Back',
    subtitle: 'Helping homeowners rebuild healthier after damage or environmental concerns',
    description:
      'For homeowners dealing with mold, moisture damage, poor indoor air quality, or other environmental issues, SENERGY360 provides assessments and build-back project management. Our goal is not just to repair the damage, but to understand why it happened and how to rebuild in a healthier way.',
    href: '/services/assessments',
    coreSystems: [
      'Indoor air quality and ventilation',
      'Moisture and mold risk',
      'Electrical system layout and exposure',
      'Water filtration and plumbing systems',
      'Building envelope performance',
    ],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Integrated Healthy Home Design & Construction
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              SENERGY360 provides three core services that guide clients through every stage of creating
              a healthier home. Each service is built around the SENERGY360 CORE Systems Framework.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80">
            Our services are organized into three core categories that reflect the main ways homeowners
            work with SENERGY360. Whether a client is planning a new custom home, needs guidance during
            construction, or is rebuilding after mold or moisture damage, SENERGY360 provides a clear
            path forward. By connecting our services to the CORE Systems Framework, we ensure that every
            project is approached as a complete building system rather than a collection of isolated
            construction components.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {SERVICES.map((service) => (
              <div
                key={service.num}
                className="bg-card-bg border-l-4 border-l-primary border border-border rounded-lg p-8 lg:p-10 shadow-md hover:shadow-lg hover:border-l-accent transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white font-bold">{service.num}</span>
                      </div>
                      <div>
                        <h2 className="font-heading text-2xl text-foreground">{service.title}</h2>
                        <p className="text-sm text-muted">{service.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-muted leading-relaxed mb-6">{service.description}</p>
                    <Link
                      href={service.href}
                      className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                  <div className="bg-primary-bg rounded-lg p-6 border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                      CORE Systems Focus
                    </h3>
                    <div className="space-y-2">
                      {service.coreSystems.map((system) => (
                        <div key={system} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                          <p className="text-xs text-muted">{system}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Framework Works Together */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-8">
            How the Framework Works Together
          </h2>
          <p className="text-white/70 leading-relaxed mb-10">
            The three SENERGY360 services represent different phases of the healthy home journey:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: 'Assessment', desc: 'Identifies issues and opportunities' },
              { step: 'Design + Build', desc: 'Creates and constructs the healthier structure' },
              { step: "Owner's Representation", desc: 'Protects the project and coordinates the team' },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.step}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-10 max-w-2xl mx-auto">
            Each step is guided by the 12 CORE Systems, ensuring that architecture, materials, air, water,
            lighting, electrical design, and interior wellness all work together.
          </p>
        </div>
      </section>

      {/* Complete Approach */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Complete Healthy Home Approach
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            By combining architecture, building science, construction expertise, and project oversight,
            SENERGY360 offers a level of integration rarely found in residential construction.
          </p>
          <p className="text-muted leading-relaxed">
            Rather than focusing on a single aspect of building, our team guides the entire process &mdash;
            helping clients create homes that support durability, comfort, and long-term well-being.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Let&apos;s Discuss Your Project
            </h2>
            <p className="text-muted">
              Whether you&apos;re planning a new build, need guidance on an existing project, or want a
              healthy home assessment, we&apos;re here to help.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="services" />
          </div>
        </div>
      </section>
    </div>
  );
}
