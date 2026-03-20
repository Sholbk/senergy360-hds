import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Healthy Home Assessments + Build-Back — SENERGY360',
  description: 'Helping homeowners rebuild healthier after mold, moisture damage, poor indoor air quality, or other environmental issues.',
};

export default function AssessmentsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-medium uppercase tracking-wider mb-3">Our Services</p>
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              Healthy Home Assessments + Build-Back
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Helping homeowners rebuild healthier after damage or environmental concerns
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground/80 mb-4">
            Some clients come to SENERGY360 not for a new home, but because their current home has been
            affected by mold, moisture damage, poor indoor air quality, or other environmental issues.
            In these cases, the goal is not just to repair the damage, but to understand why it happened
            and how to rebuild in a healthier way.
          </p>
          <p className="text-lg leading-relaxed text-foreground/80">
            SENERGY360 provides Healthy Home Assessments and Build-Back Project Management for homeowners
            who need a clear strategy for restoring their home.
          </p>
        </div>
      </section>

      {/* Root Cause Focus */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Focused on Root Cause, Not Just Symptoms
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Traditional home inspections often focus on structural safety or code compliance, while
            remediation companies typically focus on removing contamination. What is often missing is a
            comprehensive evaluation of why the problem occurred and how the home should be rebuilt to
            prevent it from happening again.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            Our assessments focus on the building conditions that may have contributed to the problem,
            such as enclosure failures, moisture pathways, ventilation issues, material choices, plumbing
            leaks, or poor system integration. Areas of evaluation may include:
          </p>
          <div className="space-y-3">
            {[
              'Building envelope conditions and moisture pathways',
              'Roof drainage, flashing, and exterior penetrations',
              'Ventilation systems and airflow balance',
              'HVAC system performance and filtration',
              'Plumbing systems and concealed leak risks',
              'Interior materials that may contribute to indoor environmental issues',
              'Electrical layout considerations affecting sleeping areas and living spaces',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-8">
            Ideal for Homeowners Dealing With
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Mold contamination',
              'Water damage',
              'Moisture-related building failures',
              'Unhealthy interior conditions',
              'Poor ventilation or indoor air concerns',
              'A need for healthier renovation or rebuild guidance',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-card-bg border border-border rounded-lg p-4">
                <span className="w-2 h-2 rounded-full bg-highlight-orange flex-shrink-0 mt-1.5" />
                <p className="text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Build-Back Planning */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Planning a Healthy Home Build-Back
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Once the conditions of the home are understood, SENERGY360 works with the homeowner to outline
            a healthy home build-back strategy. This plan focuses on rebuilding affected areas of the home
            using better building practices and materials so that the repaired spaces support healthier
            living conditions moving forward.
          </p>
          <p className="text-muted leading-relaxed mb-6">
            From there, we help create a practical roadmap for rebuilding with better methods, healthier
            materials, and improved long-term performance. Recommendations may include:
          </p>
          <div className="space-y-3">
            {[
              'Improved moisture management and drainage strategies',
              'Upgraded ventilation and air filtration systems',
              'Replacement of materials with healthier alternatives',
              'Improvements to plumbing systems and leak detection',
              'Electrical layout adjustments where appropriate',
              'Interior finish selections that support better indoor air quality',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working With Teams */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Working Alongside Remediation and Construction Teams
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Healthy Home Building Assessments are often performed in coordination with mold remediation
            companies, restoration contractors, and other specialists involved in the repair process.
          </p>
          <p className="text-muted leading-relaxed mb-4">
            SENERGY360 can help guide communication between the homeowner and these professionals to
            ensure that the rebuild work follows sound building science principles and supports long-term
            building performance.
          </p>
          <p className="text-muted leading-relaxed">
            We can also remain involved during the rebuild process to help coordinate with remediation
            teams, contractors, and other specialists so the work stays aligned with healthy-building goals.
            In some cases, SENERGY360 may continue assisting the client through the rebuild phase by
            providing Owner&apos;s Representative services to help oversee the reconstruction process.
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
              'Healthy home building assessment',
              'Root-cause review of building failures',
              'Moisture and enclosure observations',
              'Ventilation and HVAC review',
              'Plumbing and leak-risk review',
              'Material and finish guidance for rebuild',
              'Healthy home build-back planning',
              'Project management and coordination during reconstruction',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <p className="text-sm text-white/80">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-white/70 leading-relaxed mt-8">
            This service helps homeowners move beyond temporary fixes and rebuild their home on a healthier path.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Need Help Restoring Your Home?
            </h2>
            <p className="text-muted">
              Tell us about your situation and we&apos;ll discuss how SENERGY360 can help you
              rebuild on a healthier path.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="assessments" />
          </div>
        </div>
      </section>
    </div>
  );
}
