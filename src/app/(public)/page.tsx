import Link from 'next/link';
import Image from 'next/image';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

const CORE_SYSTEMS = [
  { num: 1, title: 'Architectural Design & Site Preparation' },
  { num: 2, title: 'Building Science & Performance Enclosure' },
  { num: 3, title: 'Healthy Building Materials & Finish Systems' },
  { num: 4, title: 'Climate Control & Ventilation' },
  { num: 5, title: 'Electrical Systems (Low-EMF Design)' },
  { num: 6, title: 'Circadian Lighting Systems' },
  { num: 7, title: 'Low-Voltage & Smart Integration Systems' },
  { num: 8, title: 'Solar & Alternative Power Systems' },
  { num: 9, title: 'Plumbing Design' },
  { num: 10, title: 'Water Quality & Advanced Filtration' },
  { num: 11, title: 'Mold Prevention & Non-Toxic Cleaning' },
  { num: 12, title: 'Home Furnishings & Biophilic Interior Wellness' },
];

const PROBLEMS = [
  'Moisture intrusion and mold growth',
  'Poor ventilation and indoor air quality',
  'Materials that affect indoor environments',
  'Poorly planned electrical and lighting systems',
  'Water systems that lack proper filtration',
];

const SERVICES = [
  {
    title: 'Design + Build with FASWALL',
    desc: 'High-performance healthy homes designed from the structure outward using mineral-based insulated concrete form systems.',
    href: '/services/design-build',
  },
  {
    title: "Owner's Representation + Project Management",
    desc: 'Protecting the client\'s investment and guiding the project team through design and construction.',
    href: '/services/owners-representation',
  },
  {
    title: 'Healthy Home Assessments + Build-Back',
    desc: 'Helping homeowners rebuild healthier after damage or environmental concerns.',
    href: '/services/assessments',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white py-24 lg:py-32 min-h-[600px] flex items-center overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="SENERGY360 Healthy Home"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Building the Next Generation of Healthy Homes
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-4">
              SENERGY360 is a healthy home design and construction firm integrating architecture, building science,
              and high-performance construction to create homes that support human health, durability, and long-term
              living environments.
            </p>
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              Through our proprietary CORE Systems Framework, we design and build homes where the structure, materials,
              air, water, lighting, and electrical systems work together to create a healthier indoor environment.
            </p>
            <p className="text-white/60 text-sm font-medium tracking-wide uppercase mb-8">
              Architecture. Building Science. Construction.<br />
              Working together to build better homes.
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

      {/* CORE Systems Framework Diagram Section */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="font-heading text-3xl lg:text-4xl mb-4">
              Homes Should Be Designed as Complete Systems
            </h2>
            <p className="text-white/70 max-w-3xl mx-auto leading-relaxed">
              Most homes are built by separating disciplines. Architecture, mechanical systems, materials, electrical
              infrastructure, and interior environments are often designed independently. At SENERGY360, we approach
              homes differently.
            </p>
          </div>
          <p className="text-white/70 max-w-3xl mx-auto text-center leading-relaxed mb-12">
            Our CORE Systems Framework organizes the twelve building systems that influence the health and
            performance of a home, ensuring that every part of the structure works together as a complete
            living environment.
          </p>

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
                  <h3 className="text-sm font-semibold text-white">{system.title}</h3>
                </div>
              </div>
            ))}
          </div>

          <p className="text-white/60 text-center mt-8 max-w-2xl mx-auto text-sm leading-relaxed">
            By organizing projects around these systems, we help ensure that the home supports comfort,
            durability, and healthier indoor living conditions.
          </p>

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

      {/* Why Most Homes Fail */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Modern Homes Face Modern Problems
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            Many homes today are built using methods that prioritize speed and cost efficiency rather than long-term
            building performance. As a result, common problems can develop over time that affect both the structure
            and the indoor living environment.
          </p>
          <div className="space-y-3 mb-8">
            {PROBLEMS.map((problem) => (
              <div key={problem} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-4">
                <span className="w-2 h-2 rounded-full bg-highlight-orange flex-shrink-0 mt-2" />
                <p className="text-sm text-muted leading-relaxed">{problem}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed mb-4">
            In many cases, these issues occur because the building systems that influence the indoor
            environment were never coordinated during design.
          </p>
          <p className="text-foreground font-medium">
            SENERGY360 was created to address this gap.
          </p>
          <p className="text-muted leading-relaxed mt-4">
            By combining architecture, building science expertise, and construction experience, we help design
            and build homes that function as balanced and resilient living environments.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              How SENERGY360 Can Help
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Whether you are planning a new home, rebuilding after environmental issues, or seeking expert guidance
              for a construction project, SENERGY360 offers services that support each stage of the healthy home journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group bg-card-bg border border-border rounded-lg p-8 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-heading text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">{service.desc}</p>
                <span className="text-sm text-primary font-medium">
                  Learn more &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Clients Work With SENERGY360 */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6 text-center">
            Why Clients Work With SENERGY360
          </h2>
          <p className="text-muted leading-relaxed text-center mb-8">
            SENERGY360 brings together the perspectives that are often separated in residential construction:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Builder',
              'Healthy-building expert',
              'Project guide',
              'Architecture-driven planning',
              'System-based thinking',
            ].map((item) => (
              <div key={item} className="bg-card-bg border border-border rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed text-center mt-8">
            We help clients make better decisions early, coordinate complex project teams, and create homes
            that support both building durability and everyday living.
          </p>
        </div>
      </section>

      {/* Closing Section */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            A Better Way to Design, Build, and Restore Homes
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Whether you are building a new FASWALL home, looking for expert guidance during new construction,
            or rebuilding after environmental damage, SENERGY360 provides a clear and integrated path forward.
          </p>
          <p className="text-white/80 leading-relaxed mb-8">
            Our work is grounded in building science, guided by the CORE Systems Framework, and focused on
            creating homes that support health, resilience, and long-term performance.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Explore Our Services
          </Link>
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
