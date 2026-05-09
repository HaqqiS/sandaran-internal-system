import { HeroSection } from "~/components/homepage/hero-section";
import { HomepageShell } from "~/components/homepage/homepage-shell";
import { PortfolioSection } from "~/components/homepage/portfolio-section";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      <HomepageShell session={session}>
        <div className="bg-[var(--hp-bg)]">
          <HeroSection />
          <PortfolioSection />
          <div className="min-h-screen" />
        </div>
      </HomepageShell>
    </HydrateClient>
  );
}
