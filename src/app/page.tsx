import { ExpertiseSection } from "~/components/homepage/expertise-section";
import { GrandFooter } from "~/components/homepage/grand-footer";
import { HeroSection } from "~/components/homepage/hero-section";
import { HomepageShell } from "~/components/homepage/homepage-shell";
import { PhilosophySection } from "~/components/homepage/philosophy-section";
import { PortfolioSection } from "~/components/homepage/portfolio-section";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      <HomepageShell session={session}>
        {/* Konten Utama (Berada di atas Footer) */}
        <div className="relative z-10 bg-[var(--hp-bg)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] pb-10">
          <HeroSection />
          <PortfolioSection />
          <PhilosophySection />
          <ExpertiseSection />
        </div>

        {/* Grand Footer (Tersembunyi di bawah konten utama, diungkap lewat scroll) */}
        <GrandFooter />
      </HomepageShell>
    </HydrateClient>
  );
}
