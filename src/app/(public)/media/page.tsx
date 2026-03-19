import Link from 'next/link';
import Image from 'next/image';
import LeadCaptureForm from '@/components/public/LeadCaptureForm';

export const metadata = {
  title: 'Media — SENERGY360 News, Videos & Press',
  description: 'Podcasts, interviews, and press coverage featuring SENERGY360 founder Brian Johnson on healthy home design, building biology, and non-toxic construction.',
};

const MEDIA_ITEMS = [
  {
    title: 'Interview with Renee Dee',
    description: 'In this episode, we sit down with Brian Johnson and Mike Teolis to explore how Colorbeam Lighting and SENERGY360 are redefining residential living through collaboration.',
    url: 'https://www.youtube.com/watch?v=9lwLMb-AMpI',
    image: 'https://senergy360.com/wp-content/uploads/2026/01/Iconic-Hour-Lighting-the-Way.png',
    imageAlt: 'Iconic Hour Podcast - Lighting the Way',
  },
  {
    title: 'Interview with Michael Rubino',
    description: 'Never Been Sicker: Revolutionizing the Building Industry with Brian Johnson from SENERGY360.',
    url: 'https://youtu.be/9NE4OTrZzFM?si=VjaSk9m5SJeVwGYT',
    image: 'https://senergy360.com/wp-content/uploads/2026/01/Michael-Rubino-Indoor-Air-Quality-Expert.png',
    imageAlt: 'Michael Rubino Indoor Air Quality Expert',
  },
  {
    title: 'Interview with Renee Dee',
    description: 'In this episode, we sit down with Brian Johnson, founder of SENERGY360, and Nate Gossage, founder of Living Stone Builders, to explore how design, construction, and wellness intersect in the creation of healthy homes.',
    url: 'https://youtu.be/LNtdtl3UZIE?si=AM4gCnRXCL7AUTLh',
    image: 'https://senergy360.com/wp-content/uploads/2026/01/Iconic-Hour-Under-One-Roof.png',
    imageAlt: 'ICONIC HOUR - Under One Roof',
  },
  {
    title: 'Interview with Lauren Riddei',
    description: 'Faswall, Reiki, and Spiritual Missions: with Natural Builder Brian Johnson.',
    url: 'https://podcasts.apple.com/us/podcast/haus-holistics/id1827968233?i=1000729964590',
    image: 'https://senergy360.com/wp-content/uploads/2025/10/haus-HOLISTICS-Lauren-Riddei.png',
    imageAlt: 'haus HOLISTICS Lauren Riddei interview with Brian Johnson',
  },
  {
    title: 'GDC Building For Health | NTE LIVE!',
    description: 'Brian Johnson: High Performance Athlete Building High Performance, Healthy Homes.',
    url: 'https://youtu.be/OOjTvnzWC6s?si=Jjc7bZX-KxPImguZ',
    image: 'https://senergy360.com/wp-content/uploads/2025/10/Green-Design-Center-1.png',
    imageAlt: 'Green Design Center',
  },
  {
    title: 'Interview with Kayla Barnes-Lentz',
    description: 'Creating a Healthy Home with Brian Johnson.',
    url: 'https://podcasts.apple.com/us/podcast/creating-a-healthy-home-with-brian-johnson/id1591130227?i=1000618611943',
    image: 'https://senergy360.com/wp-content/uploads/2025/04/Longevity-Optimization-with-Kayla-Barnes-Lentz.png',
    imageAlt: 'Creating a Healthy Home with Brian Johnson, Longevity Optimization with Kayla Barnes-Lentz',
  },
  {
    title: 'Interview with Season Johnson 1/3',
    description: 'Brian Johnson on the Thrive Through Cancer Podcast.',
    url: 'https://podcasts.apple.com/us/podcast/ep-34-how-to-mold-proof-your-home/id1639591486?i=1000609452359',
    image: 'https://senergy360.com/wp-content/uploads/2025/04/Thriving-Through-Cancer-Mold-Proof-Your-Home.png',
    imageAlt: 'Thriving Through Cancer - Mold Proof Your Home',
  },
  {
    title: 'Interview with Season Johnson 2/3',
    description: 'Brian Johnson on the Thrive Through Cancer Podcast.',
    url: 'https://podcasts.apple.com/us/podcast/ep-35-how-to-minimize-emf-exposure-in-your-home/id1639591486?i=1000610531385',
    image: 'https://senergy360.com/wp-content/uploads/2025/04/Thriving-Through-Cancer-EMF.png',
    imageAlt: 'Thriving Through Cancer - EMF',
  },
  {
    title: 'Interview with Season Johnson 3/3',
    description: 'Brian Johnson on the Thrive Through Cancer Podcast.',
    url: 'https://podcasts.apple.com/us/podcast/ep-36-does-your-house-need-a-probiotic-lets-analyze/id1639591486?i=1000611420290',
    image: 'https://senergy360.com/wp-content/uploads/2025/04/Copy-of-Thriving-Through-Cancer-1.png',
    imageAlt: 'Thriving Through Cancer',
  },
  {
    title: 'Interview with Myers Detox',
    description: 'Dr. Wendy Myers, Nontoxic Home Design: Mold, EMF, Nontoxic Building Materials With Brian Johnson.',
    url: 'https://youtu.be/OrZmBR9E4l8?si=ArvA8Q1oItf83LE3',
    image: 'https://senergy360.com/wp-content/uploads/2025/08/Meyers-Detox.png',
    imageAlt: 'Myers Detox',
  },
  {
    title: 'Biohacking and Beyond! with ELi Abela',
    description: 'Episode 36: Building the Future: Biohacking Wellness through Regenerative Homes with Brian Johnson.',
    url: null,
    image: 'https://senergy360.com/wp-content/uploads/2025/12/Biohaking-and-Beyond.png',
    imageAlt: 'Episode 36: Building the Future: Biohacking Wellness through Regenerative Homes with Brian Johnson',
  },
  {
    title: 'Interview with Mollie Eastman',
    description: 'Brian Johnson on the Sleep is a Skill Podcast.',
    url: 'https://www.sleepisaskill.com/podcasts/episode-240',
    image: 'https://senergy360.com/wp-content/uploads/2025/11/Sleep-as-a-Skill-Podcast-1.png',
    imageAlt: 'Sleep as a Skill Podcast',
  },
  {
    title: 'Interview with Builder Straight Talk',
    description: 'Builder Straight Talk Podcast.',
    url: 'https://youtu.be/9sPPmjNqC44?si=8agjks-ef6o9JnQS',
    image: 'https://senergy360.com/wp-content/uploads/2025/06/Builder-Straight-Talk-Podast.png',
    imageAlt: 'Builder Straight Talk Podcast',
  },
  {
    title: 'Interview with Matt Blackburn',
    description: 'Constructing a Healthy Home.',
    url: 'https://youtu.be/28uh1JvwgDg?si=ZueTsoDlzOe04Vv5',
    image: 'https://senergy360.com/wp-content/uploads/2025/03/Matt-Blackburn-Podcast.png',
    imageAlt: 'Matt Blackburn Podcast',
  },
  {
    title: 'Interview with Ashley Taylor Wellness',
    description: 'Brian Johnson on the Ashley Taylor Wellness Podcast.',
    url: 'https://podtail.com/fr/podcast/high-maintenance-hippie-podcast/029-holistic-homes-mold-prevention-emf-protection-/',
    image: 'https://senergy360.com/wp-content/uploads/2025/02/Ashley-Taylor-Wellness.png',
    imageAlt: 'Brian Johnson - Ashley Taylor Wellness',
  },
  {
    title: 'Interview with Wellness Mama',
    description: "Brian Johnson's Interview with Katie Wells \u2014 Wellness Mama.",
    url: 'https://youtu.be/cBsDKRhgeT8?si=98F5L7VD0DvKaWZ7',
    image: 'https://senergy360.com/wp-content/uploads/2025/02/Katie-Wells-Wellness-Mama.png',
    imageAlt: 'Katie Wells - Wellness Mama Interview',
  },
  {
    title: 'Interview with Laura Kissmann',
    description: "Brian Johnson's Interview with Quantum Healthy \u2014 Laura Kissmann Wellness.",
    url: 'https://open.spotify.com/episode/5a6XlOsMaSXIaVH3ydtmC2',
    image: 'https://senergy360.com/wp-content/uploads/2025/02/Laura-Kissmann-Wellness.png',
    imageAlt: 'Brian Johnson Interview with Laura Kissmann Wellness',
  },
  {
    title: 'Interview with Sarah Kleiner',
    description: 'Is Your Home Making You Sick? Brian Johnson on the Sarah Kleiner Wellness Podcast.',
    url: 'https://youtu.be/UnLj6jo2P7Q?si=-FMCw8FHK4znXCtr',
    image: 'https://senergy360.com/wp-content/uploads/2025/02/Is-Your-Home-Making-You-Sick.jpeg',
    imageAlt: 'Is Your Home Making You Sick. With Brian Johnson and Sarah Kleiner',
  },
  {
    title: 'Interview with Paula Baker Laporte',
    description: 'Paula Baker-Laporte KnowWeWell Interview.',
    url: null,
    image: 'https://senergy360.com/wp-content/uploads/2024/06/03.14.2024_20Paula_20Baker_20Laporte_20banner_0.jpg-2-1024x576.png',
    imageAlt: 'Paula Baker-Laporte KnowWeWell Interview',
  },
  {
    title: 'Interview with Mike Teolis',
    description: 'Brian Johnson Interview on KnowWeWell.',
    url: null,
    image: 'https://senergy360.com/wp-content/uploads/2024/06/12.19.2023_20Brian_20Johnson_20Banner_0.jpg-2-1024x576.png',
    imageAlt: 'Brian Johnson Interview on KnowWeWell',
  },
  {
    title: 'Write up in Natural Awakening Tucson',
    description: 'Natural Awakening Tucson.',
    url: 'https://issuu.com/naturaltucson/docs/0724_natucs_final_digital',
    image: 'https://senergy360.com/wp-content/uploads/2024/05/FireShot-Capture-033-Fwd_-Your-Health-Wellness-Guide-•-April-2024-Natural-Awakenings-Tuc_-mail.google.com_-3-1024x282.png',
    imageAlt: 'Natural Awakening Tucson',
  },
  {
    title: 'Interview with Grateful Heart TV',
    description: 'Interview with Grateful Heart TV Rebecca Rains.',
    url: 'https://podcasts.apple.com/us/podcast/episode-102-how-to-easily-build-a-healthy-home/id1487706774?i=1000580627375',
    image: 'https://senergy360.com/wp-content/uploads/2024/08/GratefulHeart.-tv-How-to-Build-a-Healthy-Home.png',
    imageAlt: 'Interview with Grateful Heart TV Rebecca Rains',
  },
  {
    title: 'Interview with Holistic with Heidi',
    description: 'Brian Johnson interview with Holistic with Heidi on the Lifelong Podcast.',
    url: null,
    image: 'https://senergy360.com/wp-content/uploads/2024/08/Holistic-with-Heidi-Lifelong-OPodcast.png',
    imageAlt: 'Brian Johnson interview with Holistic with Heidi Lifelong Podcast',
  },
  {
    title: 'Interview with Evolving Wellness',
    description: 'Brian Johnson on the Evolving Wellness Podcast.',
    url: 'https://podcasts.apple.com/us/podcast/is-your-home-making-you-sick-overweight-and-tired/id1550150550?i=1000589206436',
    image: 'https://senergy360.com/wp-content/uploads/2024/08/The-Evolving-Wellness-Podcast-1.png',
    imageAlt: 'The Evolving Wellness Podcast',
  },
];

export default function MediaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-foreground text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-6xl leading-tight mb-6">
              SENERGY360 Media
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              In the news and out in the world.
            </p>
          </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MEDIA_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative aspect-video">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Brian Johnson CTA */}
      <section className="py-20 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-4xl mb-4">
            Book SENERGY360&apos;s Brian Johnson
          </h2>
          <h3 className="text-xl text-white/90 mb-6">
            Transform Your Understanding of Healthy Home Construction
          </h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Transform your next event with Brian Johnson, the nation&apos;s only General Contractor triple-certified by the Building Biology Institute.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Media Inquiries */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl text-foreground mb-4">
            Media Inquiries
          </h2>
          <p className="text-muted mb-4 max-w-2xl mx-auto">
            Media inquiries for SENERGY360 are welcome! We&apos;re excited to share how we&apos;re transforming healthy home construction by prioritizing cutting-edge technology, wellness-focused solutions, and sustainable practices.
          </p>
          <p className="text-muted mb-8 max-w-2xl mx-auto">
            From non-toxic materials to designs that promote optimal health, our mission is to create spaces that support the well-being of individuals and families. Reach out to learn more about how we&apos;re redefining what it means to live in a truly healthy home.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors"
          >
            Media Inquiries
          </Link>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-16 bg-primary-bg">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadCaptureForm sourcePage="media" />
        </div>
      </section>
    </div>
  );
}
