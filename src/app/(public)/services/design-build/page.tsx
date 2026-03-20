import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Design + Build with FASWALL — SENERGY360',
  description: 'High-performance healthy homes designed from the structure outward using FASWALL mineral-based insulated concrete form systems.',
};

export default function DesignBuildPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Our Services</p>
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Design + Build with FASWALL
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              High-performance healthy homes designed from the structure outward
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            SENERGY360 offers architectural design and construction services for homes built with FASWALL
            mineral-based insulated concrete form systems. This service is for clients who want a new home
            designed and built with durability, moisture resilience, and long-term health in mind.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            Our team includes a licensed AIA architect within SENERGY360, allowing architecture, building science,
            and construction strategy to be integrated from the beginning. Because the wall system affects nearly
            every part of building performance, we design around FASWALL from the earliest stages of the project
            so the structure, enclosure, mechanical systems, and interior environment work together properly.
          </p>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            A Complete Healthy Home Approach
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            This service is ideal for clients seeking a complete healthy home approach that prioritizes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              'Durable mineral-based construction',
              'Stronger moisture and mold resistance',
              'Thermal mass and energy stability',
              'Healthier material strategies',
              'Integrated design and construction planning',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                <p className="text-muted">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed">
            Through this process, SENERGY360 helps clients create homes that are not only beautiful, but built
            to support long-term performance and healthier indoor living.
          </p>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Architecture Informed by Building Science
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            The architectural design process at SENERGY360 begins with a strong understanding of how buildings
            interact with their environment. Factors such as solar orientation, prevailing winds, drainage patterns,
            and surrounding landscape conditions all influence how a home should be designed.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            By incorporating these considerations early in the planning phase, our design team can develop homes
            that naturally support comfort, energy stability, and moisture management.
          </p>
          <div className="space-y-3">
            {[
              'Site analysis and building orientation',
              'Passive solar design strategies',
              'Natural daylight integration',
              'Indoor and outdoor spatial relationships',
              'Environmental response to climate conditions',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Designed Around FASWALL */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Architecture Designed Around High-Performance Wall Systems
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 architectural services are specifically developed around FASWALL insulated composite
            concrete form (ICCF) construction, a mineral-based wall system that supports durability, thermal
            mass, and improved moisture resilience.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            Because wall systems influence the structure, mechanical systems, and building envelope performance
            of the home, they must be considered during the earliest stages of architectural design. Designing
            with FASWALL from the beginning allows our team to coordinate:
          </p>
          <div className="space-y-3 mb-8">
            {[
              'Structural reinforcement and wall thickness',
              'Window and door detailing',
              'Roof connections and load paths',
              'Insulation and vapor management strategies',
              'Integration with mechanical and electrical systems',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed">
            This integrated approach ensures that the architecture fully benefits from the performance
            characteristics of the wall assembly.
          </p>
        </div>
      </section>

      {/* Construction Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Construction Built on Building Science
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Every SENERGY360 construction project begins with a strong emphasis on the building enclosure,
            which includes the walls, roof, windows, insulation layers, and air barriers that separate
            the indoor environment from the outside climate.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            When this system is designed and installed correctly, it helps protect the home from moisture
            intrusion, improves indoor comfort, and allows ventilation systems to operate more effectively.
            SENERGY360 focuses heavily on proper installation of:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'High-performance wall systems',
              'Roofing assemblies and drainage details',
              'Air and vapor control layers',
              'Insulation strategies and thermal mass',
              'Window and door integration',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthy Materials */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Healthy Materials & Interior Finishes
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            Material selection plays an important role in construction. SENERGY360 works with project teams
            to prioritize materials that support indoor air quality and long-term durability. This may include:
          </p>
          <div className="space-y-3 mb-8">
            {[
              'Mineral-based wall finishes',
              'Low-emission interior materials',
              'Durable flooring systems',
              'Cabinetry and finish materials selected with indoor air quality in mind',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed">
            The goal is to extend healthy building principles from the structure of the home into the
            interior living environment.
          </p>
        </div>
      </section>

      {/* What This Includes */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl mb-8">
            What This Includes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Custom home architectural design using FASWALL',
              'Site planning and early design guidance',
              'Building science and enclosure strategy',
              'Structural engineering coordination',
              'Healthy materials and finish direction',
              'Integrated planning for ventilation, lighting, water, and core systems',
              'Construction execution and oversight',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-white/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Ready to Design + Build Your Healthy Home?
            </h2>
            <p className="text-muted">
              Tell us about your project and we&apos;ll discuss how SENERGY360 can help you design and
              build a high-performance home with FASWALL.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="design-build" />
          </div>
        </div>
      </section>
    </div>
  );
}
