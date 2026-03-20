import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Building Envelope — SENERGY360',
  description: 'Why the building envelope is the most important system in a healthy home and how SENERGY360 designs high-performance enclosures.',
};

const CONTROL_LAYERS = [
  {
    title: 'Bulk Water from Rain and Roof Drainage',
    description:
      'The first line of defense is keeping liquid water out of the building assembly through proper roof drainage, wall flashing, window and door integration, and foundation waterproofing.',
  },
  {
    title: 'Air Movement Through Leaks and Penetrations',
    description:
      'Uncontrolled air movement carries moisture, reduces energy performance, and compromises indoor air quality. Continuous air barrier systems control air leakage at every point in the building enclosure.',
  },
  {
    title: 'Vapor Transmission Through Wall Assemblies',
    description:
      'Moisture in the form of water vapor moves through building materials by diffusion. Wall assemblies must be designed with proper vapor profiles so moisture can dry out rather than being trapped inside.',
  },
  {
    title: 'Thermal Control Through Insulation and Thermal Mass',
    description:
      'Insulation is only one part of thermal performance. SENERGY360 also addresses thermal bridging, insulation continuity, and the interaction between insulation and air/vapor control layers.',
  },
  {
    title: 'Durability of Materials Exposed to Environmental Conditions',
    description:
      'A building envelope that performs well in year one but degrades over time is not a successful design. SENERGY360 selects materials and assemblies that maintain performance for decades.',
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
              Why the Building Envelope Is the Most Important System in a Healthy Home
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              The building envelope is the boundary between the indoor and outdoor environments.
              It determines how your home manages air, moisture, temperature, and durability over time.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            In healthy home construction, the building envelope is one of the most critical systems
            in the entire structure. The envelope includes the walls, roof, windows, insulation, and
            all the layers that separate the indoor environment from the outside climate.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            This system determines how well a home manages air movement, moisture, temperature, and
            durability over time. When the building envelope is designed correctly, it protects the
            home from many of the issues that commonly affect residential buildings, including mold
            growth, poor indoor air quality, energy loss, and structural deterioration.
          </p>
        </div>
      </section>

      {/* Building Science Approach */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Building Science Approach to the Envelope
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            Rather than relying on conventional construction practices alone, SENERGY360 applies a
            building science approach that evaluates how the envelope manages:
          </p>
          <div className="space-y-6">
            {CONTROL_LAYERS.map((layer) => (
              <div
                key={layer.title}
                className="bg-card-bg border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-3">{layer.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{layer.description}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed mt-8">
            When these layers are designed correctly and installed properly, the building envelope
            becomes a protective shell that helps the home maintain consistent indoor conditions year-round.
          </p>
        </div>
      </section>

      {/* Relationship Between Envelope and Indoor Health */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            The Relationship Between the Envelope and Indoor Health
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            A well-designed building enclosure supports several aspects of healthy living.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            First, it helps control moisture, which is one of the most important factors in preventing
            mold growth. Homes that stay dry are far less likely to develop microbial issues inside
            walls, ceilings, or crawl spaces.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            Second, a properly sealed envelope improves indoor air quality by controlling where air
            enters and exits the home. This allows ventilation systems to deliver filtered fresh air
            in a controlled manner rather than relying on uncontrolled air leakage through the structure.
          </p>
          <p className="text-muted leading-relaxed">
            Third, the envelope helps regulate indoor comfort and energy stability, reducing temperature
            swings and improving overall building performance.
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
                Because the wall assembly makes up the largest portion of the building envelope, it
                plays a major role in determining how the structure performs.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                This is one of the reasons SENERGY360 focuses on mineral-based wall systems such as
                FASWALL. These assemblies provide structural strength, insulation, and vapor permeability
                that help the building manage moisture more effectively than many conventional systems.
              </p>
              <p className="text-muted leading-relaxed mb-6">
                When combined with proper roof design, flashing details, drainage strategies, and
                ventilation systems, the wall assembly becomes part of a larger building science
                strategy that protects the home for decades.
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
            Integrating the Envelope Into the CORE Systems Framework
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            The building envelope is closely connected with several other systems within the SENERGY360
            CORE Systems Framework, including architectural design and site orientation, healthy building
            materials, mold prevention strategies, and climate control and ventilation systems.
          </p>
          <p className="text-white/80 leading-relaxed mb-8">
            By designing these systems together rather than separately, SENERGY360 ensures that the home
            functions as a complete, coordinated environment rather than a collection of individual
            construction components.
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
            A home built with a well-designed envelope is better protected from moisture intrusion,
            structural degradation, and indoor environmental issues.
          </p>
          <p className="text-muted leading-relaxed">
            For SENERGY360, the goal is not simply to build a home that performs well during the first
            few years of occupancy. The goal is to create a structure that maintains health, durability,
            and comfort for generations. That is why building envelope performance remains one of the
            most important priorities in every SENERGY360 project.
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
