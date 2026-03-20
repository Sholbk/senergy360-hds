import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: "Owner's Representation + Project Management — SENERGY360",
  description: "Protecting the client's investment and guiding the project team through design and construction with healthy building expertise.",
};

export default function OwnersRepresentationPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Our Services</p>
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Project Management + Owner&apos;s Representation
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Protecting the client&apos;s investment and guiding the project team
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            Not every client needs SENERGY360 to fully design and build the home. Some already have an architect,
            contractor, or partial team in place, but want an experienced healthy-building expert to help guide
            the process.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            Through our Project Management and Owner&apos;s Representation services, SENERGY360 works on behalf
            of the client to help coordinate the project team, review major decisions, and keep the home aligned
            with the original goals for quality, health, and performance.
          </p>
        </div>
      </section>

      {/* Why This Service */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            An Advocate for the Homeowner
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            As an Owner&apos;s Representative, SENERGY360 works directly for the homeowner or developer rather
            than for the construction team. This allows us to provide independent guidance focused on the
            long-term performance and success of the project.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            This service is especially valuable on custom homes where many moving parts must come together
            correctly. We help bridge the gap between the owner, architect, engineers, consultants, and
            contractor so key details do not get missed.
          </p>
          <p className="text-muted leading-relaxed">
            Using the CORE Systems Framework, we review how major systems are being integrated across the
            project, including the building enclosure, ventilation, materials, electrical design, water
            systems, and interior wellness considerations.
          </p>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-8">
            Ideal for Clients Who
          </h2>
          <div className="space-y-4">
            {[
              'Already have a design or construction team',
              'Want an expert advocate representing their interests',
              'Need oversight during design and construction',
              'Want healthy building principles integrated into the project',
              'Need help coordinating decisions across multiple consultants and trades',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-4">
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                <p className="text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Team Coordination */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Project Team Coordination
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            One of the most important responsibilities of an Owner&apos;s Representative is maintaining
            communication and coordination between the different professionals involved in the project.
            SENERGY360 helps facilitate collaboration between:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Architects and design teams',
              'Structural and mechanical engineers',
              'Contractors and subcontractors',
              'Specialty consultants and product suppliers',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building Science Guidance */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Building Science & System Integration Guidance
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            Because SENERGY360&apos;s work is grounded in building science and healthy home design, our
            Owner&apos;s Representative services often focus on reviewing how the various systems within
            the home interact. This may include reviewing topics such as:
          </p>
          <div className="space-y-3">
            {[
              'Building envelope and moisture management strategies',
              'Ventilation and climate control systems',
              'Electrical infrastructure and layout considerations',
              'Water filtration and plumbing system design',
              'Lighting systems and indoor environmental comfort',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed mt-6">
            This guidance helps ensure that the different technical systems in the home function together
            as a coordinated whole.
          </p>
        </div>
      </section>

      {/* Construction Oversight */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Construction Oversight & Progress Monitoring
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            During construction, SENERGY360 may continue serving as the client&apos;s representative by
            reviewing project progress and supporting communication between the construction team and
            the homeowner. This role can include:
          </p>
          <div className="space-y-3">
            {[
              'Site visits during critical construction stages',
              'Reviewing installation of building systems',
              'Helping coordinate communication between trades',
              'Monitoring adherence to performance goals',
              'Assisting with problem-solving when field conditions change',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
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
              "Owner's Representative services",
              'Project team coordination',
              'Design and system review',
              'Building science guidance',
              'Material and assembly review',
              'Construction-phase oversight',
              'Quality control support for key installations',
              'Guidance using the SENERGY360 CORE Systems Framework',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-white/80">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-white/70 leading-relaxed mt-8">
            This role helps protect the client&apos;s investment while giving the project a more organized
            and performance-driven path.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Need Expert Guidance for Your Project?
            </h2>
            <p className="text-muted">
              Tell us about your project and we&apos;ll discuss how SENERGY360 can serve as your
              Owner&apos;s Representative.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="owners-representation" />
          </div>
        </div>
      </section>
    </div>
  );
}
