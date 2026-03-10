import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Why Healthy Homes Matter — SENERGY360',
  description: 'Understand why the indoor environment matters for human health and how conventional construction practices fall short of creating truly healthy living spaces.',
};

const CONSTRUCTION_CHALLENGES = [
  'Most residential insulation and air barrier systems are designed for energy efficiency alone, without considering moisture management or indoor air quality.',
  'Conventional wood framing is susceptible to moisture damage, mold growth, and structural degradation over time.',
  'Many common building materials — including paints, adhesives, sealants, flooring, and cabinetry — emit volatile organic compounds (VOCs) and other chemicals into the indoor air.',
  'HVAC systems are often improperly sized, poorly ducted, or designed without adequate fresh air ventilation, leading to stagnant air and poor filtration.',
  'Electrical wiring is installed without consideration for electromagnetic field (EMF) exposure in sleeping areas and primary living spaces.',
  'Water quality is rarely addressed during the design process, leaving homeowners exposed to contaminants in municipal or well water.',
  'Lighting systems are designed for brightness and aesthetics, not for circadian rhythm support or long-term health.',
  'The design team (architect, engineer, contractor) rarely communicates about how their individual systems affect each other — leading to performance gaps and hidden problems.',
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
              The home you live in has a direct impact on your health. Understanding why matters more
              than most people realize.
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
            People spend approximately 90% of their time indoors, and a significant portion of that time is
            spent at home. The quality of the indoor environment — the air you breathe, the water you drink,
            the materials you touch, the light you&apos;re exposed to — has a measurable impact on your
            physical health, mental clarity, sleep quality, and long-term well-being.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            Yet the vast majority of homes are built without any meaningful consideration for how the building
            itself affects the health of the people living in it. Conventional construction focuses on code
            compliance, cost efficiency, and speed — not on creating an indoor environment that supports
            human health.
          </p>
          <p className="text-muted leading-relaxed">
            The result is homes that may look good on the surface but contain hidden risks: poor indoor air
            quality, moisture problems that lead to mold, chemical emissions from building materials, inadequate
            ventilation, contaminated water, and electrical systems that create unnecessary EMF exposure. These
            issues are not always visible — but their effects on health are real and well-documented.
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
            The conventional construction industry has operated the same way for decades. While building
            codes have improved in some areas, they represent a minimum standard — not a standard for health.
            Here are some of the most common challenges in conventional residential construction:
          </p>
          <div className="space-y-4">
            {CONSTRUCTION_CHALLENGES.map((challenge, index) => (
              <div key={index} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-4">
                <span className="w-2 h-2 rounded-full bg-highlight-orange flex-shrink-0 mt-2" />
                <p className="text-sm text-muted leading-relaxed">{challenge}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Designing Homes as Living Systems */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Designing Homes as Living Systems
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            A healthy home is not a collection of individual products or certifications — it is an integrated
            system. The building envelope affects air quality. The ventilation system affects moisture management.
            The electrical system affects sleep. The water system affects what you drink and bathe in. The
            materials affect what you breathe. Every system influences every other system.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            This is why SENERGY360 approaches home design and construction as a systems integration challenge,
            not a series of disconnected trade installations. Our CORE Systems Framework identifies twelve
            critical building systems and coordinates them together from the design phase through construction.
            The result is a home that functions as a complete, healthy living environment — not just a
            structure that meets minimum code requirements.
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
            The health effects of a poorly built home are not always immediate. Mold can develop slowly behind
            walls. VOCs can off-gas for months or years. Inadequate ventilation gradually degrades indoor air
            quality. EMF exposure accumulates over time. Poor water quality compounds day after day.
          </p>
          <p className="text-white/80 leading-relaxed">
            Building a healthy home is not just about avoiding immediate problems — it is about creating a
            living environment that supports the long-term health of every person who lives in it. This
            requires a design approach that considers not just how the home looks on day one, but how it
            will perform over ten, twenty, and fifty years of occupancy. At SENERGY360, we design for the
            long term — because your health is a long-term investment.
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
            A healthy home is not a luxury — it is a fundamental need. The air you breathe, the water you
            drink, the materials that surround you, and the systems that control your indoor environment all
            have a direct impact on how you feel, how you sleep, and how well your body can function over time.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 exists to design and build homes that take this seriously. We combine architectural
            design, building science, engineering coordination, and construction expertise into a unified
            process that puts human health at the center of every decision. The result is homes that are
            not just beautiful and well-built — but genuinely healthier places to live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
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
