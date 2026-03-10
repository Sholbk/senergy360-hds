import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Building Process — SENERGY360 Integrated Design & Construction',
  description: 'The SENERGY360 six-phase integrated design and building process — from discovery through final performance verification.',
};

const PHASES = [
  {
    num: 1,
    title: 'Discovery & Project Vision',
    content: [
      'Every SENERGY360 project begins with a thorough discovery process. We take the time to understand your goals, your family\'s health priorities, your site conditions, your budget parameters, and your vision for how you want to live in your home.',
      'This phase includes an in-depth consultation where we discuss your priorities for indoor air quality, material preferences, energy goals, water quality concerns, and any specific health sensitivities. We also evaluate the building site for solar orientation, drainage, soil conditions, wind patterns, and any environmental factors that will influence the design.',
      'The output of this phase is a clear project vision document that establishes the goals, scope, and design direction for the project — ensuring that every team member is aligned from the start.',
    ],
  },
  {
    num: 2,
    title: 'Architectural Design',
    content: [
      'With the project vision established, our in-house AIA architect develops the architectural design. This is not a conventional design process — every decision is informed by building science, healthy-building principles, and construction knowledge.',
      'During this phase, we develop floor plans, elevations, sections, and details that integrate the CORE Systems Framework from the start. Wall assemblies, window placement, daylighting strategies, spatial flow, and material selections are all designed together — not layered on after the fact.',
      'We also begin coordinating with structural engineering requirements, particularly for projects using FASWALL wall systems. The goal is a design that is beautiful, functional, healthy, and buildable — with no surprises during construction.',
    ],
  },
  {
    num: 3,
    title: 'Building Science & System Integration',
    content: [
      'This is where SENERGY360\'s approach fundamentally differs from conventional architecture. Before engineering and construction documents are finalized, we conduct a comprehensive building science review of the design.',
      'This includes detailed analysis of the building envelope — moisture management strategies, air barrier continuity, vapor profiles, thermal bridging, and insulation performance. We also coordinate all twelve CORE Systems, ensuring that the HVAC design works with the envelope, the electrical layout supports low-EMF goals, the plumbing integrates with the water filtration strategy, and the lighting design supports circadian health.',
      'The output is a fully integrated design where every system has been coordinated with every other system — eliminating the performance gaps that plague conventionally designed homes.',
    ],
  },
  {
    num: 4,
    title: 'Engineering & Technical Coordination',
    content: [
      'Once the building science integration is complete, we coordinate with structural engineers, MEP (mechanical, electrical, plumbing) engineers, and specialty consultants to develop the technical documents needed for permitting and construction.',
      'SENERGY360 manages this coordination directly — ensuring that engineering decisions support the building science and health goals of the project, rather than compromising them. This is particularly important for FASWALL projects, where the structural engineering must be specifically designed for the ICCF wall system.',
      'We review all engineering documents for compatibility with the architectural design, building science strategy, and CORE Systems Framework before they are finalized.',
    ],
  },
  {
    num: 5,
    title: 'Construction & Project Oversight',
    content: [
      'During construction, SENERGY360 provides project oversight to ensure that the design intent is properly executed in the field. This includes regular site visits, construction progress reviews, quality assurance inspections, and coordination with the general contractor and trades.',
      'Our construction experience allows us to identify potential issues before they become problems — and to verify that critical details like air barrier continuity, moisture management, and mechanical system installation are done correctly. We serve as the owner\'s representative, ensuring that the project team delivers what was designed.',
      'This phase also includes material verification — confirming that specified healthy-building materials are actually being installed, and that no substitutions have been made that could compromise indoor air quality or building performance.',
    ],
  },
  {
    num: 6,
    title: 'Final Performance & Healthy Living',
    content: [
      'Before the home is occupied, SENERGY360 conducts a final performance review. This includes verification of all building systems, air quality testing, HVAC balancing and commissioning, and a comprehensive walkthrough to confirm that every detail meets our standards.',
      'We also provide homeowners with a healthy living guide — including recommendations for maintaining indoor air quality, water filtration schedules, cleaning product guidance, humidity management, and ongoing maintenance of building systems.',
      'The goal is not just to hand over a finished house — but to ensure that the homeowner understands how to maintain the healthy living environment we have designed and built for them. This is the final step in the SENERGY360 process, and it is what sets our projects apart from conventional construction.',
    ],
  },
];

export default function BuildingProcessPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              The SENERGY360 Integrated Design & Building Process
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              A six-phase process that brings together architecture, building science, engineering,
              and construction into a unified approach to building healthier homes.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80">
            Building a healthy, high-performance home requires more than good intentions — it requires a
            disciplined process that coordinates every decision from initial concept through final occupancy.
            SENERGY360&apos;s six-phase process ensures that nothing falls through the cracks, and that
            every system is designed, coordinated, and built to work together as a complete healthy living environment.
          </p>
        </div>
      </section>

      {/* Phases */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {PHASES.map((phase) => (
              <div
                key={phase.num}
                className="relative bg-card-bg border border-border rounded-lg p-6 lg:p-8"
              >
                {/* Phase Number Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{phase.num}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider font-medium">Phase {phase.num}</p>
                    <h3 className="font-heading text-xl lg:text-2xl text-foreground">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                {/* Phase Content */}
                <div className="space-y-4 pl-0 lg:pl-[4.5rem]">
                  {phase.content.map((paragraph, index) => (
                    <p key={index} className="text-sm text-muted leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A Different Way to Build */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            A Different Way to Build Homes
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            The conventional construction process is fragmented — the architect designs, the engineer stamps,
            and the contractor builds, often with minimal communication between them. SENERGY360&apos;s
            integrated process eliminates these gaps by coordinating every discipline and every system from
            the very beginning.
          </p>
          <p className="text-white/80 leading-relaxed">
            The result is a home that is designed with intention, built with precision, and engineered to
            protect the health of the people who live in it — for decades to come. This is not just a
            different process. It is a different standard for residential construction.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-muted">
              Tell us about your vision and we&apos;ll walk you through how our integrated
              process can bring it to life.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="building-process" />
          </div>
        </div>
      </section>
    </div>
  );
}
