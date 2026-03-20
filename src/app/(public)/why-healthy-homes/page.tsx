import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Why Healthy Homes Matter — SENERGY360',
  description: 'Understand why the indoor environment matters for human health and how SENERGY360 designs homes that support long-term well-being.',
};

const INDOOR_ISSUES = [
  'Moisture accumulation within wall assemblies',
  'Poorly ventilated indoor spaces',
  'Materials that release unwanted chemical compounds',
  'Lighting that does not support natural sleep cycles',
  'Electrical systems that were not thoughtfully planned',
  'Water systems that do not address contaminants',
];

const CONSTRUCTION_CHALLENGES = [
  'Inadequate moisture management',
  'Ventilation systems that do not balance properly',
  'Materials selected without considering indoor air quality',
  'Electrical layouts that place high-load systems near sleeping areas',
  'Water systems that lack proper filtration',
];

export default function WhyHealthyHomesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Why Healthy Homes Matter
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              A home should be a place that supports health, comfort, and long-term well-being.
            </p>
          </div>
        </div>
      </section>

      {/* The Indoor Environment Matters */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            The Indoor Environment Matters
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Most people spend a large portion of their lives indoors. The quality of the indoor
            environment can influence comfort, sleep quality, respiratory health, and overall well-being.
            Homes that are not properly designed for air movement, moisture control, and material
            performance may develop issues that are difficult to detect during everyday living.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            However, many modern homes are built primarily for speed and cost efficiency rather than
            long-term environmental performance. As a result, important factors that influence indoor
            living conditions are often overlooked during the design and construction process.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            Examples can include:
          </p>
          <div className="space-y-3">
            {INDOOR_ISSUES.map((issue) => (
              <div key={issue} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-4">
                <span className="w-2 h-2 rounded-full bg-highlight-orange flex-shrink-0 mt-1.5" />
                <p className="text-sm text-muted leading-relaxed">{issue}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed mt-6">
            While each of these issues may seem small individually, together they can influence the
            overall quality of the living environment.
          </p>
        </div>
      </section>

      {/* Common Construction Challenges */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Common Construction Challenges
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            In many residential projects, different systems within the home are designed independently.
            Architects, engineers, mechanical contractors, electricians, and material suppliers may all
            work separately without a coordinated strategy guiding how the systems interact. This
            fragmented process can lead to common building challenges such as:
          </p>
          <div className="space-y-3">
            {CONSTRUCTION_CHALLENGES.map((challenge) => (
              <div key={challenge} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-4">
                <span className="w-2 h-2 rounded-full bg-highlight-orange flex-shrink-0 mt-1.5" />
                <p className="text-sm text-muted leading-relaxed">{challenge}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed mt-6">
            Addressing these issues later can become expensive and difficult once construction is complete.
          </p>
        </div>
      </section>

      {/* Designing Homes as Living Systems */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Designing Homes as Living Systems
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Healthy home construction focuses on understanding how the systems within a home interact.
            Architecture, materials, air, water, light, and electrical systems all influence the indoor
            environment.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            When these systems are planned together from the beginning, the home can function as a
            stable and balanced living environment. This is the approach used by SENERGY360.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            Through our CORE Systems Framework, we evaluate the major building systems that affect the
            indoor environment and ensure they work together to support long-term durability and
            healthier living conditions. This process allows us to address many potential problems before
            construction begins, creating homes that are designed to perform well throughout their lifespan.
          </p>
          <Link
            href="/core-framework"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Explore the CORE Framework
          </Link>
        </div>
      </section>

      {/* A Long-Term Perspective */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            A Long-Term Perspective
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Healthy home construction is not simply about adding specialty products or installing advanced
            equipment. It begins with thoughtful planning, durable construction methods, and an understanding
            of how buildings interact with their environment.
          </p>
          <p className="text-white/80 leading-relaxed">
            By integrating architectural design, building science principles, and construction expertise,
            SENERGY360 focuses on creating homes that provide stable indoor conditions, improved durability,
            and long-term performance. The result is a home designed not only for appearance or efficiency,
            but for the overall quality of the living environment.
          </p>
        </div>
      </section>

      {/* Building with Health in Mind */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Building with Health in Mind
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 was founded on the belief that homes should support the people who live inside them.
            By combining architecture, building science, engineering coordination, and construction experience,
            our team works to design homes that provide healthier indoor environments while maintaining
            structural integrity and lasting performance.
          </p>
          <p className="text-muted leading-relaxed mb-8">
            Through careful planning and coordinated design, we help homeowners create living spaces that
            support comfort, resilience, and long-term well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
            >
              About SENERGY360
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-md hover:bg-primary-bg transition-colors"
            >
              Our Services
            </Link>
          </div>
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
              Tell us about your project and learn how SENERGY360 can help you create a home
              that truly supports your health and well-being.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="why-healthy-homes" />
          </div>
        </div>
      </section>
    </div>
  );
}
