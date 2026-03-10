import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Contact — SENERGY360 Healthy Home Design & Construction',
  description: 'Get in touch with SENERGY360 to discuss your healthy home design, construction, or assessment project.',
};

const WHAT_TO_EXPECT = [
  {
    step: '1',
    title: 'Submit Your Information',
    description:
      'Fill out the form with your name, contact details, and a brief description of your project or questions. The more detail you provide, the better we can prepare for our conversation.',
  },
  {
    step: '2',
    title: 'Initial Review',
    description:
      'Our team will review your submission and assess how SENERGY360 can best support your project. We evaluate every inquiry personally — this is not an automated process.',
  },
  {
    step: '3',
    title: 'Personal Response',
    description:
      'Within two business days, a member of our team will reach out to schedule a conversation. We will discuss your goals, answer your questions, and determine the best next steps for your project.',
  },
  {
    step: '4',
    title: 'Discovery Consultation',
    description:
      'For projects that are a good fit, we schedule an in-depth discovery consultation to understand your vision, site conditions, budget parameters, and health priorities — the first step in the SENERGY360 integrated design process.',
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
              Whether you&apos;re planning a new healthy home, need consulting on an existing project,
              or want to learn more about our services, we&apos;d like to hear from you.
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
                Tell Us About Your Project
              </h2>
              <p className="text-muted leading-relaxed mb-8">
                Fill out the form below and a member of our team will be in touch within two
                business days to discuss your project and how SENERGY360 can help.
              </p>
              <div className="bg-card-bg rounded-lg border border-border p-8">
                <LeadCaptureForm sourcePage="contact" />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-heading text-3xl text-foreground mb-6">
                Contact Information
              </h2>
              <div className="space-y-8">
                <div className="bg-primary-bg rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">SENERGY360</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Healthy Home Design, Architecture & Construction
                  </p>
                </div>

                <div className="bg-primary-bg rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Services We Offer</h3>
                  <ul className="space-y-2">
                    {[
                      'Healthy Home Architectural Design',
                      'FASWALL ICCF Design & Engineering',
                      'Building Science Consulting',
                      "Owner's Representative Services",
                      'Healthy Home Assessments',
                      'Construction Support',
                    ].map((service) => (
                      <li key={service} className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-primary-bg rounded-lg p-6 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Project Types</h3>
                  <ul className="space-y-2">
                    {[
                      'New healthy home design and construction',
                      'FASWALL ICCF residential projects',
                      'Healthy home assessments for existing homes',
                      'Building science consulting for builders and architects',
                      'Owner\'s representation for custom home projects',
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
              Here is what happens after you reach out to SENERGY360.
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
            SENERGY360 is committed to designing and building the healthiest homes in the world.
            Every project begins with a conversation. We look forward to hearing about yours.
          </p>
        </div>
      </section>
    </div>
  );
}
