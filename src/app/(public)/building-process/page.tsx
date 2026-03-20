import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Building Process — SENERGY360 Integrated Design & Construction',
  description: 'The SENERGY360 six-phase integrated design and building process — from discovery through final performance.',
};

const PHASES = [
  {
    num: 1,
    title: 'Discovery & Project Vision',
    content:
      'Every project begins with understanding the client\'s goals for health, performance, and long-term living. During this phase, SENERGY360 works with the homeowner to define priorities related to site selection, environmental conditions, lifestyle needs, and wellness objectives. We evaluate factors such as site orientation and solar exposure, surrounding environmental conditions, water drainage and topography, proximity to environmental concerns, and desired wellness features within the home.',
  },
  {
    num: 2,
    title: 'Architectural Design',
    content:
      'Once the project vision is established, the architectural design process begins under the guidance of the SENERGY360 architectural team led by a licensed AIA architect. During this stage, the home\'s layout, orientation, and spatial planning are developed in coordination with healthy building principles. The design process considers both aesthetics and performance, ensuring that the home supports natural light, ventilation, and efficient building systems. For homes built with FASWALL mineral-based wall systems, architectural details are designed specifically around the structural and building science characteristics of the assembly.',
  },
  {
    num: 3,
    title: 'Building Science & System Integration',
    content:
      'As the architectural design develops, SENERGY360 integrates the systems that influence the home\'s indoor environment and long-term durability. Using the SENERGY360 CORE Systems Framework, our team evaluates how the major building systems interact, including building envelope performance, ventilation and climate control systems, electrical layout and lighting design, plumbing and water filtration systems, and interior materials and finishes. This stage ensures that each system supports the others rather than working independently.',
  },
  {
    num: 4,
    title: 'Engineering & Technical Coordination',
    content:
      'Once the design framework is established, SENERGY360 coordinates with structural engineers and other technical consultants to ensure the building systems are properly engineered and documented. Structural engineering, mechanical design, and technical details are developed in alignment with the architectural plans and building science strategy established earlier in the project. This coordinated approach reduces construction conflicts and improves overall project efficiency.',
  },
  {
    num: 5,
    title: 'Construction & Project Oversight',
    content:
      'During construction, SENERGY360 remains actively involved to ensure that the design intent and healthy building standards are properly implemented in the field. In many projects, SENERGY360 serves as an Owner\'s Representative, helping guide the project team and protect the client\'s investment. Field oversight may include reviewing construction details and installations, coordinating with contractors and trades, monitoring envelope and moisture management details, and ensuring mechanical and electrical systems follow the design strategy.',
  },
  {
    num: 6,
    title: 'Final Performance & Healthy Living',
    content:
      'Once construction is complete, the home becomes a carefully designed environment that supports healthy daily living. The result is a residence where architecture, materials, ventilation, water systems, lighting, and electrical design all work together to create a comfortable and resilient indoor environment. This integrated process allows SENERGY360 to deliver homes that go far beyond conventional construction — homes designed to support long-term health, durability, and performance.',
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
              Designing and building a healthy home requires more than selecting the right materials or
              installing better mechanical equipment. It requires a coordinated process where architecture,
              building science, engineering, and construction are aligned from the beginning.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80">
            SENERGY360 approaches each project through an integrated design and construction process that
            allows every system in the home to work together. This process helps prevent common building
            failures and ensures that the home performs as intended once it is occupied. Rather than
            addressing issues later during construction, our team focuses on establishing the right
            foundation during the earliest planning stages.
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
                <div className="pl-0 lg:pl-[4.5rem]">
                  <p className="text-sm text-muted leading-relaxed">{phase.content}</p>
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
            SENERGY360 combines architecture, building science expertise, engineering coordination,
            and construction experience into one cohesive process. By guiding each phase of the project
            through our CORE Systems Framework, we ensure that every system within the home contributes
            to a healthier living environment.
          </p>
          <p className="text-white/70 leading-relaxed">
            Our goal is simple: To design and build homes that perform as well as they look &mdash;
            homes engineered for health, durability, and long-term comfort.
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
