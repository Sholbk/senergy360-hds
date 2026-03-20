import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'CORE Systems Framework — SENERGY360',
  description: 'The SENERGY360 CORE Systems Framework: twelve core building systems that influence human health and building performance, designed and coordinated together.',
};

const CORE_SYSTEMS = [
  {
    num: 1,
    title: 'Architectural Design & Site Preparation',
    description:
      'Thoughtful site planning, home orientation, spatial design, and early project decisions that influence energy performance, drainage, and natural environmental integration.',
  },
  {
    num: 2,
    title: 'Building Science & Performance Enclosure',
    description:
      'The building envelope, including wall systems, roof design, insulation strategies, air barriers, vapor control, and moisture management that determine the long-term durability and efficiency of the structure.',
  },
  {
    num: 3,
    title: 'Healthy Building Materials & Finish Systems',
    description:
      'Selection of non-toxic, durable, and mineral-based materials that support healthier indoor environments and long-term building performance.',
  },
  {
    num: 4,
    title: 'Climate Control & Ventilation',
    description:
      'Advanced HVAC systems designed to deliver balanced airflow, filtration, humidity control, and fresh air exchange for optimal indoor air quality.',
  },
  {
    num: 5,
    title: 'Electrical Systems (Low-EMF Design)',
    description:
      'Electrical infrastructure designed with attention to wiring methods, grounding, shielding strategies, and thoughtful layout to minimize unnecessary electromagnetic exposure.',
  },
  {
    num: 6,
    title: 'Circadian Lighting Systems',
    description:
      'Lighting systems designed to support human biology, visual comfort, and natural circadian rhythms throughout the day.',
  },
  {
    num: 7,
    title: 'Low-Voltage & Smart Integration Systems',
    description:
      'Technology infrastructure designed with wired networks, intelligent controls, and integrated systems that reduce reliance on unnecessary wireless devices.',
  },
  {
    num: 8,
    title: 'Solar & Alternative Power Systems',
    description:
      'Integration of solar energy, battery storage, and alternative power strategies to support energy resilience and clean electrical power.',
  },
  {
    num: 9,
    title: 'Plumbing Design',
    description:
      'Water distribution systems designed for durability, leak prevention, serviceability, and efficient water delivery.',
  },
  {
    num: 10,
    title: 'Water Quality & Advanced Filtration',
    description:
      'Whole-home water purification and filtration systems designed to reduce contaminants and improve the quality of water used throughout the home.',
  },
  {
    num: 11,
    title: 'Mold Prevention & Non-Toxic Cleaning',
    description:
      'Construction and maintenance strategies that reduce moisture risk, prevent microbial growth, and support healthier cleaning practices.',
  },
  {
    num: 12,
    title: 'Home Furnishings & Biophilic Interior Wellness',
    description:
      'Interior environments that extend healthy-building principles into daily living through natural materials, healthier furnishings, and biophilic design connections to nature.',
  },
];

export default function CoreFrameworkPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              The SENERGY360 CORE Systems Framework
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              The philosophy behind everything we do
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            Every SENERGY360 project is guided by our CORE Systems Framework, a structured approach that
            organizes the major building systems influencing human health and building performance.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            Most homes are designed with separate disciplines working independently &mdash; architecture,
            mechanical systems, electrical design, materials, and interior environments are handled by
            different professionals with little coordination. This often results in buildings that
            overlook critical factors such as indoor air quality, moisture control, electrical exposure,
            lighting quality, and long-term durability.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            The SENERGY360 CORE Systems Framework organizes these elements into a coordinated system
            so that every major component of the home works together.
          </p>
        </div>
      </section>

      {/* 12 Core Systems */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              The 12 CORE Systems
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Our framework is organized into twelve core building systems that influence the health
              and performance of a home.
            </p>
          </div>

          <div className="space-y-6">
            {CORE_SYSTEMS.map((system) => (
              <div
                key={system.num}
                className="bg-card-bg border border-border rounded-lg p-6 lg:p-8 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{system.num}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-foreground mb-3">
                      {system.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {system.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Statement */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            Integration Is the Difference
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Every SENERGY360 service is guided by our CORE Systems Framework. Rather than treating the
            home as separate categories, we evaluate how the systems work together as a whole.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            By organizing projects around these systems, SENERGY360 ensures that health, durability,
            and building performance are addressed throughout the entire design and construction process.
          </p>
          <p className="text-white/80 leading-relaxed">
            This framework is what allows SENERGY360 to go beyond conventional construction and provide
            a more complete approach to healthy homes.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Ready to Build with the CORE Framework?
            </h2>
            <p className="text-muted">
              Tell us about your project and learn how the CORE Systems Framework can guide
              the design and construction of your healthy home.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="core-framework" />
          </div>
        </div>
      </section>
    </div>
  );
}
