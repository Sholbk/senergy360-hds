import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

const CORE_SYSTEMS = [
  { num: 1, title: 'Architectural Design & Site Preparation', desc: 'Thoughtful site planning, orientation, and spatial design.' },
  { num: 2, title: 'Building Science & Performance Enclosure', desc: 'Wall systems, insulation, air barriers, and moisture management.' },
  { num: 3, title: 'Healthy Building Materials & Finish Systems', desc: 'Non-toxic, durable, mineral-based materials.' },
  { num: 4, title: 'Climate Control & Ventilation', desc: 'Advanced HVAC for optimal indoor air quality.' },
  { num: 5, title: 'Electrical Systems (Low-EMF Design)', desc: 'Wiring, grounding, and shielding strategies.' },
  { num: 6, title: 'Circadian Lighting Systems', desc: 'Lighting designed to support natural rhythms.' },
  { num: 7, title: 'Low-Voltage & Smart Integration', desc: 'Wired networks and intelligent controls.' },
  { num: 8, title: 'Solar & Alternative Power', desc: 'Energy resilience and clean power strategies.' },
  { num: 9, title: 'Plumbing Design', desc: 'Durable, leak-proof water distribution.' },
  { num: 10, title: 'Water Quality & Advanced Filtration', desc: 'Whole-home water purification systems.' },
  { num: 11, title: 'Mold Prevention & Non-Toxic Cleaning', desc: 'Moisture control and healthier maintenance.' },
  { num: 12, title: 'Home Furnishings & Biophilic Interior Wellness', desc: 'Natural materials and biophilic design.' },
];

const SERVICES = [
  { title: 'Healthy Home Architectural Design', desc: 'Architecture led by an AIA architect, integrating building science and wellness from day one.', href: '/services' },
  { title: 'FASWALL ICCF Construction', desc: 'Specialized design for mineral-based wall systems with exceptional durability and mold resistance.', href: '/faswall' },
  { title: 'Building Science Consulting', desc: 'Expert guidance on building envelope, material selection, ventilation, and indoor air quality.', href: '/services' },
  { title: "Owner's Representative", desc: 'Working directly on your behalf to guide the project team and protect your investment.', href: '/services' },
  { title: 'Healthy Home Assessments', desc: 'Comprehensive evaluations of indoor air quality, moisture risks, and building performance.', href: '/services' },
  { title: 'Construction Support', desc: 'Ensuring healthy-building principles are properly implemented in the field.', href: '/services' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Designing & Building the Healthiest Homes in the World
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              SENERGY360 is a full-service healthy home design, architecture, and construction firm.
              We combine architectural design, building science, engineering coordination, and construction
              expertise into a unified process that supports human health and long-term building performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors"
              >
                Start Your Project
              </Link>
              <Link
                href="/core-framework"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white font-medium rounded-md hover:bg-white/10 transition-colors"
              >
                Explore Our Framework
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Authority Statement */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg leading-relaxed text-foreground/80">
            Our in-house AIA architect, healthy-building specialists, and construction experts work together
            to design high-performance homes built around mineral-based wall systems, clean indoor environments,
            and durable building assemblies. We combine architecture and building science to deliver what most
            construction firms cannot: <strong className="text-foreground">homes designed as complete healthy living systems.</strong>
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              Integrated Design, Consulting & Construction
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              A comprehensive team capable of guiding projects from concept through construction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-card-bg border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{service.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CORE Framework Preview */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl mb-4">
              The SENERGY360 CORE Systems Framework
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Twelve core building systems that influence the health and performance of every home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CORE_SYSTEMS.map((system) => (
              <div
                key={system.num}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg leading-none mt-0.5">
                    {system.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{system.title}</h3>
                    <p className="text-xs text-white/60">{system.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/core-framework"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
            >
              Learn More About Our Framework
            </Link>
          </div>
        </div>
      </section>

      {/* FASWALL Highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
                FASWALL Mineral-Based Wall Systems
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                At SENERGY360, the wall system is one of the most important decisions in the entire
                home-building process. We specialize in FASWALL insulated composite concrete form (ICCF)
                construction — a mineral-based system that provides exceptional durability, thermal mass,
                fire resistance, and mold resilience.
              </p>
              <ul className="space-y-3 mb-6">
                {['Exceptional Durability', 'Mold Resistance', 'Vapor Permeability', 'Thermal Mass & Energy Performance', 'Fire Resistance', 'Sound Control'].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                href="/faswall"
                className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
              >
                Learn About FASWALL
              </Link>
            </div>
            <div className="bg-primary-bg rounded-lg p-8 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Why the Wall System Matters</h3>
              <p className="text-sm text-muted leading-relaxed">
                The structure of the building determines how well the home will perform in areas such as
                moisture management, durability, thermal performance, indoor air quality, and long-term resilience.
                FASWALL provides a balanced combination of durability, breathability, and thermal mass that aligns
                with the goals of healthy home construction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Ready to Build a Healthier Home?
            </h2>
            <p className="text-muted">
              Tell us about your project and we&apos;ll be in touch to discuss how SENERGY360 can help.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="homepage" />
          </div>
        </div>
      </section>
    </div>
  );
}
