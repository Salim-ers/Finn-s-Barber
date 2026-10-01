import type { MetadataRoute } from "next";
import { journal, salon } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = salon.siteUrl;
  const pages: [string, number][] = [["", 1], ["/prestations", 0.9], ["/contact", 0.9], ["/histoire", 0.7], ["/equipe", 0.7], ["/galerie", 0.7], ["/journal", 0.6], ["/mentions-legales", 0.2], ["/politique-confidentialite", 0.2], ["/cookies", 0.2]];
  return [
    ...pages.map(([p, priority]) => ({ url: base + p, lastModified: new Date(), priority })),
    ...journal.map(a => ({ url: `${base}/journal/${a.slug}`, lastModified: new Date(a.date), priority: 0.5 }))
  ];
}
