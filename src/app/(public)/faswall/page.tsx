import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'FASWALL Mineral-Based Wall Systems — SENERGY360',
  description: 'Learn why SENERGY360 specializes in FASWALL ICCF wall systems — mineral-based construction offering superior durability, mold resistance, and thermal performance.',
};

const KEY_BENEFITS = [
  {
    title: 'Exceptional Durability',
    description:
      'FASWALL forms are made from mineralized wood fibers bonded with Portland cement, creating a wall system that resists rot, insects, and structural degradation. When filled with reinforced concrete, the result is a monolithic wall assembly that can last for generations.',
  },
  {
    title: 'Mold Resistance',
    description:
      'Unlike wood-framed walls that can trap moisture and support mold growth, FASWALL\'s mineral-based composition does not provide a food source for mold. Combined with proper building science design, this significantly reduces the risk of mold-related health issues.',
  },
  {
    title: 'Vapor Permeability',
    description:
      'FASWALL walls are vapor-permeable, meaning they can manage moisture through diffusion rather than trapping it inside wall cavities. This breathability is a key advantage over closed-cell foam and conventional ICF systems, which can trap moisture and create hidden problems.',
  },
  {
    title: 'Thermal Mass & Energy Performance',
    description:
      'The concrete core of a FASWALL wall provides significant thermal mass, helping to stabilize indoor temperatures by absorbing and slowly releasing heat. This reduces heating and cooling loads and creates a more comfortable, energy-efficient living environment.',
  },
  {
    title: 'Fire Resistance',
    description:
      'FASWALL walls achieve high fire-resistance ratings. The mineral-based forms and concrete core do not burn, providing a level of passive fire protection that wood-framed homes cannot match.',
  },
  {
    title: 'Sound Control',
    description:
      'The mass and density of FASWALL walls provide excellent sound attenuation, reducing exterior noise penetration and improving acoustic privacy between rooms. This is a significant quality-of-life improvement over lightweight wood-framed construction.',
  },
];

const COMPARISON = [
  {
    system: 'Conventional Wood Framing',
    type: 'challenges',
    points: [
      'Susceptible to moisture damage, rot, and mold growth',
      'Limited thermal mass — poor temperature stability',
      'Requires extensive air sealing and vapor barrier detailing',
      'Vulnerable to insect damage (termites, carpenter ants)',
      'Lower fire resistance without added protective systems',
      'Shorter structural lifespan compared to mineral-based systems',
      'Sound transmission between rooms and from exterior',
    ],
  },
  {
    system: 'Traditional ICF (Foam-Based)',
    type: 'mixed',
    points: [
      'Good thermal performance from continuous insulation',
      'Strong structural performance with reinforced concrete core',
      'Closed-cell foam traps moisture — no vapor permeability',
      'Foam can off-gas VOCs and other chemicals over time',
      'Insect tunneling risk in foam insulation layer',
      'Not breathable — relies entirely on mechanical ventilation for moisture control',
      'Foam is petroleum-based and less sustainable',
    ],
  },
  {
    system: 'FASWALL ICCF',
    type: 'advantages',
    points: [
      'Mineral-based — no organic materials that support mold growth',
      'Vapor-permeable — manages moisture through natural diffusion',
      'Excellent thermal mass from reinforced concrete core',
      'No foam — no off-gassing, no insect tunneling in insulation',
      'Superior fire resistance ratings',
      'Exceptional sound attenuation',
      'Designed for multi-generational durability',
    ],
  },
];

export default function FaswallPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              FASWALL Mineral-Based Wall Systems
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              A Better Foundation for Healthy Homes
            </p>
          </div>
        </div>
      </section>

      {/* Why FASWALL */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Why SENERGY360 Focuses on FASWALL
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The wall system is one of the most important decisions in the entire home-building process. It
            determines how well the building manages moisture, resists fire, controls temperature, attenuates
            sound, and performs over decades of use. Most residential construction relies on wood framing — a
            system with well-documented limitations in moisture management, durability, and long-term performance.
          </p>
          <p className="text-muted leading-relaxed">
            SENERGY360 has chosen to specialize in FASWALL insulated composite concrete form (ICCF) construction
            because it provides the best combination of durability, breathability, thermal performance, and health
            safety available in residential wall systems today. Our team has direct experience designing for and
            building with FASWALL — and we understand how to integrate it with every other system in the home.
          </p>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              Key Benefits of FASWALL Construction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {KEY_BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-card-bg border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Designed Around the Wall System */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Architecture Designed Around the Wall System
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Most architects design homes without considering the specific requirements and opportunities of
            the wall system. At SENERGY360, the wall system is a central part of the architectural design
            process. Our in-house AIA architect designs specifically for FASWALL construction, ensuring that
            the architecture takes full advantage of the system&apos;s thermal mass, structural capabilities,
            and moisture management properties.
          </p>
          <p className="text-muted leading-relaxed">
            This means window and door openings are designed for proper integration with the FASWALL forms,
            structural loads are coordinated with the reinforced concrete core, and the building envelope
            is detailed to work with — not against — the wall system&apos;s vapor-permeable characteristics.
            The result is a home where the architecture and the structure work together as one system.
          </p>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              FASWALL vs. Conventional Construction
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Understanding how different wall systems compare helps explain why SENERGY360 has
              chosen FASWALL as the foundation for our healthy home designs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COMPARISON.map((col) => (
              <div
                key={col.system}
                className={`rounded-lg p-6 border ${
                  col.type === 'advantages'
                    ? 'bg-accent/5 border-accent'
                    : col.type === 'challenges'
                    ? 'bg-card-bg border-border'
                    : 'bg-card-bg border-border'
                }`}
              >
                <h3
                  className={`font-heading text-lg mb-4 ${
                    col.type === 'advantages' ? 'text-accent-dark' : 'text-foreground'
                  }`}
                >
                  {col.system}
                </h3>
                <ul className="space-y-3">
                  {col.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
                          col.type === 'advantages'
                            ? 'bg-accent'
                            : col.type === 'challenges'
                            ? 'bg-danger'
                            : 'bg-primary'
                        }`}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built from Experience */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            Built from Experience
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SENERGY360&apos;s expertise with FASWALL is not theoretical. Our team has hands-on experience
            designing for and building with FASWALL systems. We understand the engineering coordination
            required, the construction sequencing, the integration with mechanical and electrical systems,
            and the building science details that make FASWALL perform at its best.
          </p>
          <p className="text-white/80 leading-relaxed">
            This combination of design knowledge and field experience is what allows us to deliver FASWALL
            homes that are not just structurally sound — but optimized for health, durability, and long-term
            performance.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Interested in FASWALL Construction?
            </h2>
            <p className="text-muted">
              Tell us about your project and we&apos;ll discuss how FASWALL can be the right foundation
              for your healthy home.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="faswall" />
          </div>
        </div>
      </section>
    </div>
  );
}
