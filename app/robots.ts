import type { MetadataRoute } from "next";
import { salon } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${salon.siteUrl}/sitemap.xml`, host: salon.siteUrl };
}
