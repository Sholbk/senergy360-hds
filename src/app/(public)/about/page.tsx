import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'About SENERGY360 — Why SENERGY360 Is Different',
  description: 'SENERGY360 integrates architecture, building science, and construction expertise to create homes designed for health, durability, and long-term performance.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Why SENERGY360 Is Different
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Integrating Architecture, Building Science, and Construction
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            Creating a truly healthy home requires more than selecting better materials or installing
            advanced equipment. It requires a coordinated understanding of how architecture, building
            systems, and construction practices work together to shape the indoor environment.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            Many residential projects separate these disciplines. Architects focus on design, engineers
            focus on structural systems, and contractors focus on construction. While each role is
            important, the lack of coordination between these areas can lead to homes that look beautiful
            but struggle with long-term performance issues such as moisture problems, ventilation
            imbalances, or indoor environmental concerns. SENERGY360 was created to bring these
            disciplines together.
          </p>
        </div>
      </section>

      {/* Architecture Supported by Building Science */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
                Architecture Supported by Building Science
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                SENERGY360 provides architectural design services led by a licensed AIA architect working
                within the firm. This allows the architectural design process to be closely aligned with
                the healthy building strategies that guide our work.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                By combining design expertise with building science principles, we are able to create homes
                that respond to their environment while supporting long-term durability and indoor comfort.
              </p>
              <p className="text-muted leading-relaxed">
                This approach ensures that architectural decisions consider factors such as building
                orientation, ventilation strategies, moisture management, and material performance from
                the earliest stages of the project.
              </p>
            </div>
            <div className="bg-primary-bg rounded-lg p-8 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Our Integrated Approach Means</h3>
              <ul className="space-y-3">
                {[
                  'Building science integrated into architectural design from the start',
                  'Moisture management, air quality, and durability considered in every detail',
                  'Wall assemblies and material choices made during design, not during construction',
                  'Architecture that performs as well as it looks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Knowledge */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Construction Experience That Informs the Design
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 was founded on practical construction experience. Our background in building
            high-performance homes allows us to understand how design decisions translate into real-world
            construction.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            This perspective helps bridge the gap between architectural drawings and successful building
            execution. By considering construction sequencing, trade coordination, and installation methods
            during design, many potential issues can be avoided before construction begins.
          </p>
        </div>
      </section>

      {/* High-Performance Wall Systems */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Expertise in High-Performance Wall Systems
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The building enclosure plays a major role in the durability and performance of a home.
            SENERGY360 specializes in architectural design and construction using FASWALL mineral-based
            insulated composite concrete form systems, which provide structural strength, thermal mass,
            and improved resistance to moisture-related problems.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            Our experience working with insulated concrete form construction allows us to design homes
            where the wall system, structure, and mechanical systems work together efficiently. This focus
            on durable building assemblies helps create homes designed for long-term performance.
          </p>
          <Link
            href="/faswall"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Learn About FASWALL
          </Link>
        </div>
      </section>

      {/* CORE Systems Framework */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            The CORE Systems Framework
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            One of the key distinctions of SENERGY360 is the CORE Systems Framework, which organizes the
            major systems that influence health and building performance. Rather than focusing on isolated
            aspects of construction, this framework ensures that architecture, materials, electrical design,
            water systems, ventilation, lighting, and interior environments are considered together.
          </p>
          <p className="text-white/80 leading-relaxed mb-8">
            This structured approach helps guide the entire project team and ensures that important details
            are not overlooked during design or construction.
          </p>
          <Link
            href="/core-framework"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Explore the CORE Framework
          </Link>
        </div>
      </section>

      {/* Owner's Representation */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Owner&apos;s Representation and Project Oversight
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Building a custom home often involves many professionals and technical decisions. SENERGY360
            frequently serves as an Owner&apos;s Representative, helping guide the project team and maintain
            alignment between the homeowner&apos;s goals and the design and construction process.
          </p>
          <p className="text-muted leading-relaxed">
            In this role, we help coordinate communication between architects, engineers, contractors, and
            consultants while monitoring key building systems that influence performance. This oversight
            helps protect the client&apos;s investment and ensures that healthy building strategies remain
            a priority throughout the project.
          </p>
        </div>
      </section>

      {/* Beyond New Construction */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Beyond New Construction
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 also works with existing homes through comprehensive healthy home assessments.
            These evaluations examine factors such as indoor air quality, moisture risk, electrical
            environments, water quality, and ventilation performance.
          </p>
          <p className="text-muted leading-relaxed">
            For many homeowners, these assessments provide a clear roadmap for improving the health
            and performance of their current living environment.
          </p>
        </div>
      </section>

      {/* A Different Standard */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Holistic Approach to Residential Construction
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The SENERGY360 approach combines architecture, building science expertise, and construction
            experience into one integrated framework. By coordinating the systems that influence indoor
            environmental quality and building durability, we are able to design and build homes that
            support comfort, resilience, and long-term well-being.
          </p>
          <p className="text-muted leading-relaxed">
            Our goal is to establish a higher standard for residential construction &mdash; homes designed
            not only for appearance, but for the quality of the living environment they create.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
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
            <LeadCaptureForm sourcePage="about" />
          </div>
        </div>
      </section>
    </div>
  );
}
