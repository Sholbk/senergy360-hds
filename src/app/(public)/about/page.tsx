import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'About SENERGY360 — Healthy Home Design & Construction',
  description: 'Learn how SENERGY360 combines architecture, building science, and construction expertise to design and build the healthiest homes in the world.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              The SENERGY360 Difference
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Where Architecture, Building Science, and Construction Come Together
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80">
            SENERGY360 is not a conventional architecture firm, general contractor, or consulting company. We are
            a full-service healthy home design, architecture, and construction firm that brings together the disciplines
            most homes lack under one roof: architectural design, building science, engineering coordination, and
            hands-on construction expertise. This integrated approach allows us to design and build homes that are
            healthier, more durable, and higher performing than what the conventional construction industry typically delivers.
          </p>
        </div>
      </section>

      {/* Architecture Designed with Building Science */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
                Architecture Designed with Building Science
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                Most residential architecture focuses on aesthetics and floor plans, with building performance treated
                as an afterthought. At SENERGY360, every design decision is informed by building science from the start.
                Our in-house AIA architect works alongside healthy-building specialists to ensure that each project is
                designed for structural integrity, moisture management, thermal performance, indoor air quality, and
                long-term durability — not just curb appeal.
              </p>
              <p className="text-muted leading-relaxed">
                This means decisions about wall assemblies, air barriers, vapor profiles, insulation strategies, and
                material compatibility are made during the design phase — not patched together during construction.
                The result is architecture that looks great and performs at a level most homes never achieve.
              </p>
            </div>
            <div className="bg-primary-bg rounded-lg p-8 border border-border">
              <h3 className="font-semibold text-foreground mb-4">What This Means for You</h3>
              <ul className="space-y-3">
                {[
                  'Building science integrated into architectural design from day one',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="bg-card-bg rounded-lg p-8 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Construction Experience Includes</h3>
              <ul className="space-y-3">
                {[
                  'Hands-on field experience with framing, concrete, and structural systems',
                  'Understanding of trade sequencing and construction logistics',
                  'Knowledge of how designs translate into real-world buildability',
                  'Ability to identify potential construction issues before they happen',
                  'Direct experience with FASWALL ICCF wall system installation',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
                Construction Knowledge That Shapes the Design
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                What sets SENERGY360 apart from most architecture firms is real-world construction experience.
                Our team doesn&apos;t just design on paper — we understand how buildings go together in the field.
                This means our designs are buildable, practical, and informed by the realities of construction
                sequencing, material handling, and trade coordination.
              </p>
              <p className="text-muted leading-relaxed">
                Too often, architects design details that are difficult or impossible to execute properly in the
                field, leading to compromises during construction. Because we bring construction knowledge into
                the design process, our projects avoid the costly mistakes and performance failures that come from
                disconnected design and build teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Performance Wall Systems */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Expertise in High-Performance Wall Systems
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The wall system is one of the most critical decisions in residential construction. It determines
            how the home manages moisture, temperature, air quality, fire resistance, and structural durability.
            SENERGY360 specializes in FASWALL insulated composite concrete form (ICCF) construction — a
            mineral-based wall system that provides a level of durability, breathability, and performance that
            conventional wood framing and traditional ICF systems cannot match.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            Our team has direct experience designing for and building with FASWALL systems. We understand
            the engineering requirements, the construction process, and how to integrate these wall systems
            with the rest of the building&apos;s mechanical, electrical, and plumbing systems. This is not
            theoretical knowledge — it comes from hands-on project experience.
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
            Every home is made up of interconnected systems — from the building envelope and HVAC to the
            electrical wiring, plumbing, lighting, and interior finishes. In conventional construction,
            these systems are designed and installed by different teams who rarely communicate. The result
            is homes with gaps in performance, indoor air quality issues, moisture problems, and unnecessary
            maintenance costs.
          </p>
          <p className="text-white/80 leading-relaxed mb-8">
            SENERGY360&apos;s CORE Systems Framework identifies twelve critical building systems and ensures
            they are designed and coordinated together from the start. This integrated approach is what makes
            our homes fundamentally different from conventionally built houses.
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
            Owner&apos;s Representation & Project Oversight
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Building a high-performance home requires coordination between architects, engineers, contractors,
            and specialty trades. Without strong project oversight, even well-designed homes can fall short
            during construction. SENERGY360 offers owner&apos;s representative services, working directly on
            behalf of the homeowner to ensure the project team delivers what was designed.
          </p>
          <p className="text-muted leading-relaxed">
            This includes reviewing construction progress, verifying that building science details are properly
            executed, managing timelines and budgets, and ensuring that every system is installed according to
            the design intent. We serve as the homeowner&apos;s advocate throughout the construction process —
            because the details that matter most are often the ones that get missed in the field.
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
            SENERGY360&apos;s expertise is not limited to new construction. We also provide healthy home
            assessments for existing homes — evaluating indoor air quality, moisture risks, ventilation
            performance, and material safety. Whether you are building new or improving an existing home,
            our team can help you understand what&apos;s working, what&apos;s not, and what changes will have
            the greatest impact on the health and performance of your home.
          </p>
          <Link
            href="/services"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            View Our Services
          </Link>
        </div>
      </section>

      {/* Different Standard */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Different Standard for Residential Construction
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The residential construction industry has operated the same way for decades — fragmented teams,
            reactive problem-solving, and minimal attention to the long-term health and performance of the
            building. SENERGY360 exists to change that. We bring together the disciplines that matter most —
            architecture, building science, engineering, and construction — and coordinate them into a single,
            unified process.
          </p>
          <p className="text-muted leading-relaxed">
            The result is homes that are designed with intention, built with precision, and engineered to
            protect the health of the people who live in them — for decades to come.
          </p>
        </div>
      </section>

      {/* Authority Statement */}
      <section className="py-16 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg leading-relaxed text-white/80">
            SENERGY360 is led by an AIA-licensed architect with deep expertise in building science, healthy
            materials, and construction management. Our team combines decades of experience in residential
            design, high-performance building systems, and field construction — delivering a level of
            integration and quality that most firms simply cannot offer.
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
