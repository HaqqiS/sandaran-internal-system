import { requireAuth } from "~/lib/server-auth";
import { GalleryClient } from "./gallery-client";

interface GalleryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  await requireAuth();
  const slug = (await params).slug;

  return <GalleryClient projectSlug={slug} />;
}
