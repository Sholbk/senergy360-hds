import Link from 'next/link';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'CORE Systems Framework — SENERGY360',
  description: 'The SENERGY360 CORE Systems Framework: twelve critical building systems designed and coordinated together to create truly healthy, high-performance homes.',
};

const CORE_SYSTEMS = [
  {
    num: 1,
    title: 'Architectural Design & Site Preparation',
    description:
      'Every healthy home begins with thoughtful site planning and architectural design. This includes solar orientation, prevailing wind patterns, drainage planning, spatial layout, natural daylighting strategies, and the relationship between indoor and outdoor living spaces. At SENERGY360, architectural design is not just about aesthetics — it is the foundation for how every other building system will perform. Our in-house AIA architect ensures that the design supports health, comfort, and building science from the very first sketch.',
  },
  {
    num: 2,
    title: 'Building Science & Performance Enclosure',
    description:
      'The building envelope is the most critical system in the home. It controls moisture, air movement, thermal performance, and durability. SENERGY360 designs building enclosures using advanced building science principles — addressing bulk water management, air barrier continuity, vapor transmission, and thermal control as an integrated system. We specialize in FASWALL mineral-based wall systems, which provide exceptional durability, vapor permeability, and thermal mass. Every wall section, roof assembly, and foundation detail is designed to manage moisture and maintain long-term performance.',
  },
  {
    num: 3,
    title: 'Healthy Building Materials & Finish Systems',
    description:
      'The materials inside a home directly affect indoor air quality and occupant health. SENERGY360 specifies non-toxic, low-VOC, mineral-based, and naturally derived materials wherever possible. This includes interior finishes, paints, sealants, adhesives, flooring, cabinetry, and countertops. We evaluate every material for its chemical emissions, durability, moisture compatibility, and impact on the indoor environment. Material selection is coordinated with the ventilation and air quality systems to ensure a healthy indoor environment.',
  },
  {
    num: 4,
    title: 'Climate Control & Ventilation',
    description:
      'Heating, cooling, and ventilation systems are essential to maintaining healthy indoor air quality and thermal comfort. SENERGY360 designs HVAC systems that are properly sized, ducted, and balanced — not just for temperature control, but for continuous fresh air delivery and filtration. We integrate energy recovery ventilators (ERVs), high-efficiency filtration, and humidity management to create an indoor environment that supports respiratory health and comfort year-round.',
  },
  {
    num: 5,
    title: 'Electrical Systems (Low-EMF Design)',
    description:
      'Electromagnetic fields (EMFs) from electrical wiring, panels, and devices are an often-overlooked aspect of healthy home design. SENERGY360 incorporates low-EMF electrical design strategies, including proper wiring configurations, grounding practices, panel placement, and shielding where appropriate. The goal is to reduce unnecessary EMF exposure in sleeping areas and primary living spaces without compromising the functionality of the electrical system.',
  },
  {
    num: 6,
    title: 'Circadian Lighting Systems',
    description:
      'Artificial lighting affects sleep quality, hormonal balance, and overall well-being. SENERGY360 designs lighting systems that support natural circadian rhythms — using tunable color temperature fixtures, daylighting strategies, and automated controls that shift lighting throughout the day. Morning light is designed to be energizing, while evening light shifts to warmer tones that support melatonin production and healthy sleep cycles.',
  },
  {
    num: 7,
    title: 'Low-Voltage & Smart Integration Systems',
    description:
      'Modern homes require robust low-voltage infrastructure for data, communications, security, and automation. SENERGY360 designs wired network systems and smart home integration that prioritize hardwired connections over wireless wherever possible — reducing unnecessary wireless radiation while providing faster, more reliable connectivity. Smart systems are integrated to support lighting control, HVAC management, security, and energy monitoring.',
  },
  {
    num: 8,
    title: 'Solar & Alternative Power Systems',
    description:
      'Energy resilience and clean power are important components of a healthy home. SENERGY360 designs solar and alternative power systems that are integrated into the architectural design from the start — not bolted on as afterthoughts. This includes solar panel placement, battery storage, backup power systems, and electrical panel design that supports future energy upgrades. The goal is energy independence and reduced reliance on the grid.',
  },
  {
    num: 9,
    title: 'Plumbing Design',
    description:
      'Plumbing systems affect water quality, durability, and long-term maintenance. SENERGY360 designs plumbing layouts that minimize leak risk, reduce pipe runs, and use materials that do not leach chemicals into the water supply. We coordinate plumbing design with the structural and mechanical systems to ensure proper routing, access for maintenance, and compatibility with the building envelope. Hot water systems are designed for efficiency and rapid delivery.',
  },
  {
    num: 10,
    title: 'Water Quality & Advanced Filtration',
    description:
      'Municipal water and well water can contain contaminants that affect health — including chlorine, fluoride, heavy metals, pesticides, and microplastics. SENERGY360 designs whole-home water filtration and purification systems that address these concerns at the point of entry. We also specify point-of-use filtration for drinking water and consider water quality in the selection of fixtures, pipes, and water heating systems. Clean water is a fundamental requirement for a healthy home.',
  },
  {
    num: 11,
    title: 'Mold Prevention & Non-Toxic Cleaning',
    description:
      'Mold prevention begins with building science — proper moisture management, vapor control, and material selection. But it also extends to ongoing maintenance and cleaning practices. SENERGY360 designs homes that minimize mold risk through structural and mechanical means, and we provide guidance on non-toxic cleaning and maintenance practices that support long-term indoor air quality. This includes recommendations for cleaning products, humidity monitoring, and routine maintenance schedules.',
  },
  {
    num: 12,
    title: 'Home Furnishings & Biophilic Interior Wellness',
    description:
      'The final system addresses the interior environment — furnishings, textiles, decor, and the connection between indoor spaces and the natural world. SENERGY360 integrates biophilic design principles that bring natural elements, daylight, views, and organic materials into the home. We also guide clients in selecting furnishings and textiles that are free from flame retardants, formaldehyde, and other chemicals commonly found in conventional furniture and decor. The goal is a living environment that supports physical and psychological well-being.',
  },
];

export default function CoreFrameworkPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              The SENERGY360 CORE Systems Framework
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Twelve critical building systems, designed and coordinated together, to create homes
              that truly support human health and long-term performance.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-6">
            Why Most Homes Fall Short
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Most homes are built by assembling disconnected systems — the architect designs the floor plan,
            the HVAC contractor sizes the equipment, the electrician runs the wiring, and the plumber installs
            the pipes. Each trade works independently, often without understanding how their work affects the
            others. The result is homes with gaps in performance, indoor air quality issues, moisture problems,
            energy waste, and unnecessary maintenance costs.
          </p>
          <p className="text-muted leading-relaxed">
            The SENERGY360 CORE Systems Framework takes a fundamentally different approach. We have identified
            twelve critical building systems that influence the health and performance of every home — and we
            design and coordinate all of them together from the start. This integrated approach is what makes
            SENERGY360 homes fundamentally different from conventionally built houses.
          </p>
        </div>
      </section>

      {/* 12 Core Systems */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl lg:text-4xl text-foreground mb-4">
              The 12 Core Systems
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              Each system is critical to the health and performance of the home. When designed together,
              they create a living environment that conventional construction simply cannot achieve.
            </p>
          </div>

          <div className="space-y-6">
            {CORE_SYSTEMS.map((system) => (
              <div
                key={system.num}
                className="bg-card-bg border border-border rounded-lg p-6 lg:p-8 hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{system.num}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-foreground mb-3">
                      {system.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {system.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Statement */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-6">
            Integration Is the Difference
          </h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Any builder can install an HVAC system or run electrical wiring. What makes SENERGY360 different
            is how we coordinate all twelve systems together — ensuring they complement each other rather
            than creating conflicts. The ventilation system works with the building envelope. The lighting
            supports circadian health. The materials are compatible with the air quality strategy. The
            plumbing integrates with the water filtration. Every system supports every other system.
          </p>
          <p className="text-white/80 leading-relaxed">
            This is the CORE Systems Framework — and it is the foundation of every SENERGY360 project.
          </p>
        </div>
      </section>

      {/* CTA / Lead Capture */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl text-foreground mb-4">
              Ready to Build with the CORE Framework?
            </h2>
            <p className="text-muted">
              Tell us about your project and learn how the CORE Systems Framework can guide
              the design and construction of your healthy home.
            </p>
          </div>
          <div className="bg-card-bg rounded-lg border border-border p-8">
            <LeadCaptureForm sourcePage="core-framework" />
          </div>
        </div>
      </section>
    </div>
  );
}
