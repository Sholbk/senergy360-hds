import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Building Envelope — SENERGY360',
  description: 'Why the building envelope is the most important system in your home. Learn how SENERGY360 designs high-performance enclosures for healthy, durable homes.',
};

const BUILDING_SCIENCE_LAYERS = [
  {
    title: 'Bulk Water Management',
    description:
      'The first line of defense is keeping liquid water out of the building assembly. This includes proper roof drainage, wall flashing, window and door integration, and foundation waterproofing. Failures in bulk water management are the leading cause of moisture damage and mold growth in residential construction.',
  },
  {
    title: 'Air Movement Control',
    description:
      'Uncontrolled air movement through the building envelope carries moisture, reduces energy performance, and compromises indoor air quality. SENERGY360 designs continuous air barrier systems that control air leakage at every point in the building enclosure — from the foundation to the roof. Air barrier continuity is one of the most commonly missed details in conventional construction.',
  },
  {
    title: 'Vapor Transmission',
    description:
      'Moisture in the form of water vapor moves through building materials by diffusion. The direction and rate of vapor movement depend on temperature, humidity, and the permeability of the materials in the wall assembly. SENERGY360 designs wall assemblies with proper vapor profiles — ensuring that moisture can dry out of the assembly rather than being trapped inside. This is a critical distinction from conventional construction, which often uses vapor barriers in the wrong location or creates assemblies that trap moisture.',
  },
  {
    title: 'Thermal Control',
    description:
      'Insulation is only one part of thermal performance. SENERGY360 addresses thermal bridging, insulation continuity, and the interaction between insulation and air/vapor control layers to create a complete thermal management strategy. We design for real-world thermal performance — not just R-value on paper.',
  },
  {
    title: 'Durability & Long-Term Performance',
    description:
      'A building envelope that performs well in year one but degrades over time is not a successful design. SENERGY360 selects materials and designs assemblies that maintain their performance characteristics for decades — resisting moisture damage, UV degradation, insect damage, and structural fatigue. Our preference for FASWALL mineral-based wall systems reflects this commitment to long-term durability.',
  },
];

export default function BuildingEnvelopePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Why the Building Envelope Is the Most Important System
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              The building envelope is the boundary between the indoor and outdoor environments.
              It is the single most important system in determining how your home performs — and
              how healthy it is to live in.
            </p>
          </div>
        </div>
      </section>

      {/* Building Science Approach */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Building Science Approach
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The building envelope includes every component that separates the conditioned interior of the
            home from the exterior environment — the walls, roof, foundation, windows, doors, and all the
            connections between them. This system controls moisture, air movement, thermal performance,
            and durability. When the building envelope is designed correctly, the home stays dry, comfortable,
            and energy-efficient. When it fails, the consequences can include mold growth, structural damage,
            poor indoor air quality, and excessive energy costs.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            SENERGY360 designs building envelopes using a layered approach grounded in building science
            principles. We address five critical control layers in every project:
          </p>

          <div className="space-y-6">
            {BUILDING_SCIENCE_LAYERS.map((layer) => (
              <div
                key={layer.title}
                className="bg-card-bg border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-3">{layer.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Relationship Between Envelope and Indoor Health */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            The Relationship Between the Envelope and Indoor Health
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The building envelope directly affects indoor air quality, comfort, and health. A leaky envelope
            allows unfiltered outdoor air, pollutants, allergens, and moisture to enter the home uncontrolled.
            A poorly insulated envelope creates temperature swings, drafts, and condensation. A wall assembly
            that traps moisture creates the conditions for mold growth — often hidden inside walls where it
            is not discovered until significant damage has occurred.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            A properly designed building envelope creates a controlled indoor environment where the ventilation
            system — not random air leakage — determines what air enters the home. This allows for proper
            filtration, humidity control, and consistent air quality throughout the living space.
          </p>
          <p className="text-muted leading-relaxed">
            At SENERGY360, the building envelope and the ventilation system are designed together as an
            integrated system. The envelope provides the airtight, moisture-managed boundary, and the
            mechanical ventilation system provides controlled fresh air exchange with filtration. This
            combination is the foundation of a healthy indoor environment.
          </p>
        </div>
      </section>

      {/* Why Wall Systems Matter */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
                Why Wall Systems Matter
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                The wall system is the largest component of the building envelope and has the greatest
                influence on moisture management, thermal performance, fire resistance, durability, and
                indoor air quality. The choice of wall system affects every other building system — from
                how the HVAC system is sized to how the interior finishes are applied.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                SENERGY360 specializes in FASWALL mineral-based wall systems because they provide the best
                combination of vapor permeability, thermal mass, mold resistance, fire resistance, and
                structural durability available in residential construction. Our architectural designs are
                developed specifically for FASWALL construction, ensuring that the wall system and the
                building envelope work together as a unified assembly.
              </p>
              <Link
                href="/faswall"
                className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
              >
                Learn About FASWALL
              </Link>
            </div>
            <div className="bg-foreground rounded-lg p-8 text-white">
              <h3 className="font-heading text-xl mb-4">Wall System Impact Areas</h3>
              <ul className="space-y-3">
                {[
                  'Moisture management and mold resistance',
                  'Thermal performance and energy efficiency',
                  'Fire resistance and occupant safety',
                  'Structural durability and lifespan',
                  'Indoor air quality and material safety',
                  'Sound attenuation and acoustic comfort',
                  'Compatibility with other building systems',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integration with CORE Systems */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            Integration with the CORE Systems Framework
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            The building envelope is System 2 in the SENERGY360 CORE Systems Framework — but it influences
            nearly every other system. The envelope determines how the HVAC system is designed. It affects
            where electrical penetrations occur. It influences plumbing routing and water management. It
            shapes the lighting strategy by controlling natural daylighting. It even affects interior
            material selection, since the envelope&apos;s moisture management strategy must be compatible
            with the finishes applied to it.
          </p>
          <p className="text-white/80 leading-relaxed mb-8">
            At SENERGY360, we design the building envelope first — and then coordinate every other system
            around it. This ensures that the envelope performs as intended and that no other system
            compromises its integrity.
          </p>
          <Link
            href="/core-framework"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Explore the CORE Framework
          </Link>
        </div>
      </section>

      {/* Building for Long-Term Performance */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Building for Long-Term Performance
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            A building envelope that performs well on day one but degrades over five or ten years is not a
            successful design. SENERGY360 designs envelopes for multi-generational durability — selecting
            materials that resist moisture damage, UV degradation, insect damage, and structural fatigue
            over decades of service.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            Our preference for FASWALL mineral-based wall systems reflects this commitment. Unlike wood
            framing, which is susceptible to rot, mold, and insect damage, FASWALL walls are made from
            mineralized wood fibers bonded with Portland cement and filled with reinforced concrete. The
            result is a wall assembly that is designed to last for generations — maintaining its structural
            integrity, thermal performance, and moisture management capabilities throughout the life of
            the building.
          </p>
          <p className="text-muted leading-relaxed">
            When you invest in a SENERGY360 home, you are investing in a building envelope that will
            protect your health, your comfort, and your investment for the long term.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Want to Learn More About Building Envelope Design?
            </h2>
            <p className="text-muted">
              Tell us about your project and we&apos;ll discuss how a properly designed building
              envelope can make your home healthier and more durable.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="building-envelope" />
          </div>
        </div>
      </section>
    </div>
  );
}
