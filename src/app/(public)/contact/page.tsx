import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Contact — CORE Framework',
  description: 'Get in touch with CORE Framework to learn how our construction project management platform can help streamline your builds.',
};

const WHAT_TO_EXPECT = [
  {
    step: '1',
    title: 'Submit Your Information',
    description:
      'Fill out the form with your name, contact details, and a brief description of what you\'re looking for. The more detail you provide, the better we can prepare.',
  },
  {
    step: '2',
    title: 'Initial Review',
    description:
      'Our team will review your inquiry and determine how CORE Framework can best support your needs. Every inquiry is reviewed personally.',
  },
  {
    step: '3',
    title: 'Personal Response',
    description:
      'Within two business days, a member of our team will reach out to schedule a conversation. We\'ll discuss your goals, answer questions, and determine the best next steps.',
  },
  {
    step: '4',
    title: 'Onboarding',
    description:
      'We\'ll get you set up on the platform, walk you through the features, and help you create your first project — so you can start managing builds right away.',
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Whether you&apos;re ready to streamline your builds, have questions about the platform,
              or want to see a demo, we&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Lead Capture Form */}
            <div>
              <h2 className="font-heading text-3xl text-foreground mb-6">
                Tell Us About Your Needs
              </h2>
              <p className="text-muted leading-relaxed mb-8">
                Fill out the form below and a member of our team will be in touch within two
                business days to discuss how CORE Framework can help.
              </p>
              <div className="bg-card-bg rounded-lg border border-border p-8">
                <LeadCaptureForm sourcePage="contact" />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-heading text-3xl text-foreground mb-6">
                Why CORE Framework
              </h2>
              <div className="space-y-8">
                <div className="bg-primary-bg rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">CORE Framework</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    All-in-one construction project management for builders, architects, and contractors.
                  </p>
                </div>

                <div className="bg-primary-bg rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Platform Features</h3>
                  <ul className="space-y-2">
                    {[
                      'Project Dashboard & Tracking',
                      'Document Portal with Digital Signatures',
                      'Team Collaboration & Activity Feed',
                      'Scheduling & Calendar Management',
                      'Invoicing & Payment Processing',
                      'Reports, Checklists & Owner\'s Manual',
                    ].map((service) => (
                      <li key={service} className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary-bg rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Built For</h3>
                  <ul className="space-y-2">
                    {[
                      'General Contractors & Custom Home Builders',
                      'Architects & Design Firms',
                      'Property Owners & Developers',
                      'Trade Contractors & Subcontractors',
                    ].map((type) => (
                      <li key={type} className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {type}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              What to Expect
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Here&apos;s what happens after you reach out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WHAT_TO_EXPECT.map((item) => (
              <div
                key={item.step}
                className="bg-card-bg border border-border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-16 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg leading-relaxed text-white/80">
            Every great project starts with a conversation. We look forward to hearing about yours.
          </p>
        </div>
      </section>
    </div>
  );
}
