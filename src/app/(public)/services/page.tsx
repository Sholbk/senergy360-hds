import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Services — SENERGY360 Healthy Home Design & Construction',
  description: 'Integrated design, consulting, and construction services for healthy homes. From architectural design to construction support and healthy home assessments.',
};

const SERVICES = [
  {
    title: 'Healthy Home Architectural Design',
    description:
      'Our in-house AIA architect leads every design project with building science and wellness integrated from the earliest concept. This is not cosmetic design — it is architecture informed by how buildings actually perform. Every floor plan, wall section, window placement, and material selection is evaluated for its impact on indoor air quality, moisture management, thermal performance, and long-term durability. The result is architecture that looks exceptional and functions as a healthy living environment.',
    link: null,
  },
  {
    title: 'FASWALL ICCF Design & Engineering Coordination',
    description:
      'SENERGY360 specializes in designing homes built with FASWALL insulated composite concrete form (ICCF) wall systems. We coordinate the architectural design with the structural engineering requirements specific to FASWALL construction, ensuring that the wall system is properly integrated with the foundation, roof structure, mechanical systems, and building envelope. Our direct experience with FASWALL means we understand both the design requirements and the construction process — something most architects and engineers lack.',
    link: '/faswall',
  },
  {
    title: 'Structural Engineering Integration',
    description:
      'Healthy home design requires close coordination between the architect and the structural engineer. SENERGY360 manages this integration, ensuring that structural decisions support building science goals rather than compromising them. This includes coordination of load paths, foundation systems, wall bracing, and connections — all designed to work with the specific wall system and building envelope strategy selected for the project.',
    link: null,
  },
  {
    title: 'Interior Wellness & Biophilic Design',
    description:
      'The interior of a healthy home matters as much as the structure. SENERGY360 integrates biophilic design principles — incorporating natural light, natural materials, views to nature, and spatial design that supports human well-being. Our interior design approach also addresses material safety, selecting finishes, furnishings, and coatings that are low-VOC, non-toxic, and compatible with the home\'s ventilation and air quality systems.',
    link: null,
  },
  {
    title: 'Healthy Building Expert Consulting',
    description:
      'Not every project requires full design services. SENERGY360 offers expert consulting for homeowners, builders, architects, and developers who want to improve the health and performance of their projects. This includes guidance on building envelope design, material selection, ventilation strategies, moisture management, indoor air quality, low-EMF electrical design, water filtration, and circadian lighting. We provide actionable recommendations grounded in building science — not opinions.',
    link: null,
  },
  {
    title: "Owner's Representative & Project Management",
    description:
      "Building a high-performance home involves coordinating architects, engineers, contractors, and specialty trades. Without strong oversight, critical details get missed. SENERGY360 serves as the owner's representative, working directly on behalf of the homeowner to manage the project team, review construction progress, verify that building science details are executed correctly, and protect the homeowner's investment. We are the homeowner's advocate from design through construction.",
    link: null,
  },
  {
    title: 'Healthy Home Assessments',
    description:
      'For existing homes, SENERGY360 provides comprehensive healthy home assessments. We evaluate indoor air quality, moisture risks, ventilation performance, material safety, water quality, electrical systems, and overall building performance. Each assessment results in a detailed report with prioritized recommendations — giving homeowners a clear understanding of what is affecting their home\'s health and what steps will have the greatest impact.',
    link: null,
  },
  {
    title: 'Healthy Home Construction Support',
    description:
      'Even the best designs can fail if they are not properly executed in the field. SENERGY360 provides construction support services, working alongside the general contractor and trades to ensure that healthy-building details are properly implemented. This includes reviewing critical assemblies, verifying air barrier continuity, inspecting moisture management details, and confirming that mechanical, electrical, and plumbing systems are installed according to the design intent.',
    link: null,
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Integrated Design, Consulting & Construction Services
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              SENERGY360 offers a comprehensive range of services designed to support the creation of healthy,
              high-performance homes — from initial concept through construction and beyond. Our integrated
              approach means every service is connected, ensuring nothing falls through the cracks.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              A comprehensive team capable of guiding projects from concept through construction,
              with every decision informed by building science and healthy-building principles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="bg-card-bg border border-border rounded-lg p-8 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-heading text-xl text-foreground mb-4">
                  {service.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {service.description}
                </p>
                {service.link && (
                  <Link
                    href={service.link}
                    className="text-sm text-primary font-medium hover:text-primary-dark transition-colors"
                  >
                    Learn more &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrated Approach */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            Why an Integrated Approach Matters
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            In conventional construction, the architect designs the house, the engineer stamps the plans,
            and the contractor builds it — often with minimal communication between them. This fragmented
            approach leads to performance gaps, construction errors, and homes that don&apos;t live up to
            their potential.
          </p>
          <p className="text-white/80 leading-relaxed">
            SENERGY360 eliminates these gaps by integrating architecture, building science, engineering,
            and construction expertise into a single coordinated process. Every decision is informed by
            every discipline — and the result is a home that performs as a complete, healthy system.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Let&apos;s Discuss Your Project
            </h2>
            <p className="text-muted">
              Whether you&apos;re planning a new build, need consulting on an existing project, or want a
              healthy home assessment, we&apos;re here to help.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="services" />
          </div>
        </div>
      </section>
    </div>
  );
}
