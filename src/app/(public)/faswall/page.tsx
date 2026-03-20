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
      'FASWALL walls are built around reinforced concrete cores and mineral-based materials that are resistant to rot, pests, and long-term degradation. This creates a structure designed to last for generations.',
  },
  {
    title: 'Mold Resistance',
    description:
      'Unlike conventional wood-framed construction, FASWALL walls contain mineral-based materials that are far less susceptible to mold growth, especially when combined with proper building science and moisture management strategies.',
  },
  {
    title: 'Vapor Permeability',
    description:
      'One of the unique advantages of FASWALL is that the mineralized wood fiber form allows the wall assembly to breathe and manage moisture more effectively than many conventional concrete wall systems.',
  },
  {
    title: 'Thermal Mass & Energy Performance',
    description:
      'The concrete core provides thermal mass that helps regulate temperature swings, improving comfort and energy efficiency throughout the home.',
  },
  {
    title: 'Fire Resistance',
    description:
      'The mineral-based wall assembly provides excellent fire resistance compared to traditional wood-framed structures.',
  },
  {
    title: 'Sound Control',
    description:
      'The density of the wall assembly provides strong acoustic performance, reducing outside noise and creating a quieter indoor environment.',
  },
];

const COMPARISON = [
  {
    system: 'Conventional Wood Framing',
    type: 'challenges' as const,
    intro: 'Wood framing has been the dominant residential construction method for decades. While this system can perform adequately when built carefully, it is more sensitive to moisture exposure.',
    points: [
      'Greater vulnerability to moisture intrusion',
      'Potential for mold growth when assemblies stay wet',
      'Lower structural mass and durability',
      'Shorter lifespan compared to mineral-based structures',
    ],
  },
  {
    system: 'Traditional ICF (Insulated Concrete Forms)',
    type: 'mixed' as const,
    intro: 'ICF construction improves on wood framing by using foam blocks filled with reinforced concrete. However, most ICF systems rely on expanded polystyrene (EPS) foam, which can limit vapor permeability.',
    points: [
      'Reinforced concrete structural strength',
      'Improved insulation and energy efficiency',
      'Better resistance to wind and storms',
      'Stronger and quieter homes',
    ],
  },
  {
    system: 'FASWALL Mineral-Based Wall Systems',
    type: 'advantages' as const,
    intro: 'FASWALL uses mineralized wood fiber and cement composite forms filled with reinforced concrete, providing both structural strength and balanced moisture behavior.',
    points: [
      'Reinforced concrete structural core',
      'Mineral-based materials with reduced mold risk',
      'Vapor permeability that helps manage moisture',
      'Excellent thermal mass and energy stability',
      'Strong fire resistance and acoustic performance',
      'Long-term durability with minimal degradation',
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

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            At SENERGY360, the wall system is one of the most important decisions in the entire home-building
            process. The structure of the building determines how well the home will perform in areas such as
            moisture management, durability, thermal performance, indoor air quality, and long-term resilience.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            FASWALL is fundamentally different from conventional wood framing and even many other insulated
            concrete form systems. The wall assembly is made from a mineralized wood fiber and cement composite
            form that is filled with reinforced concrete, creating a monolithic structural wall that combines
            strength, insulation, and vapor permeability.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            This system provides a balanced combination of durability, breathability, and thermal mass that
            aligns extremely well with the goals of healthy home construction.
          </p>
        </div>
      </section>

      {/* Why SENERGY360 Focuses on FASWALL */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Why SENERGY360 Focuses on FASWALL
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 has extensive experience building with insulated concrete form systems, and our
            background working with ICF construction has helped us understand the strengths and limitations
            of different wall assemblies.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            Through years of evaluating building performance, moisture behavior, and long-term durability,
            we have found that mineral-based wall systems such as FASWALL provide one of the most balanced
            solutions for healthy home construction.
          </p>
          <p className="text-muted leading-relaxed">
            Because wall systems affect nearly every aspect of a building&apos;s performance, our
            architectural services are specifically designed around this construction method. Designing
            with FASWALL from the beginning allows the structure, insulation strategy, mechanical systems,
            and interior environment to work together properly.
          </p>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-primary-bg">
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Architecture Designed Around the Wall System
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            At SENERGY360, we believe wall systems should not be treated as a simple construction choice.
            They should be part of the architectural strategy of the home. Because of this, our architectural
            services are designed specifically to work with FASWALL construction. This ensures that:
          </p>
          <div className="space-y-3 mb-6">
            {[
              'Structural engineering integrates correctly with the wall system',
              'Mechanical systems work efficiently with the thermal mass of the structure',
              'Window and roof details properly manage water and vapor movement',
              "The home's design fully benefits from the performance of the wall assembly",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed">
            By designing around the wall system from the beginning, SENERGY360 can create homes that are
            more durable, healthier, and better performing than conventional construction.
          </p>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              FASWALL vs. Conventional Construction
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Why the wall system matters for the health and performance of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {COMPARISON.map((col) => (
              <div
                key={col.system}
                className={`rounded-lg p-6 border ${
                  col.type === 'advantages'
                    ? 'bg-accent/5 border-accent'
                    : 'bg-card-bg border-border'
                }`}
              >
                <h3
                  className={`font-heading text-lg mb-3 ${
                    col.type === 'advantages' ? 'text-accent-dark' : 'text-foreground'
                  }`}
                >
                  {col.system}
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-4">{col.intro}</p>
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

      {/* CORE Framework Alignment */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Natural Fit with the CORE Systems Framework
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            FASWALL construction aligns closely with the SENERGY360 CORE Systems Framework, particularly
            in the areas of:
          </p>
          <div className="space-y-3 mb-6">
            {[
              'Building science and performance enclosure',
              'Healthy building materials',
              'Mold prevention and moisture management',
              'Long-term durability and resilience',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed">
            When combined with the other systems in the SENERGY360 framework &mdash; including advanced
            ventilation, water purification, lighting design, and electrical planning &mdash; the result
            is a home designed as a complete healthy living environment.
          </p>
        </div>
      </section>

      {/* Built from Experience */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            Built from Experience
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SENERGY360&apos;s specialization in FASWALL construction comes from years of experience
            building with insulated concrete forms and studying building science, moisture behavior,
            and indoor environmental health.
          </p>
          <p className="text-white/80 leading-relaxed">
            Our goal is not simply to build homes differently, but to build them better &mdash; using
            materials and systems designed to support long-term human health and building performance.
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
