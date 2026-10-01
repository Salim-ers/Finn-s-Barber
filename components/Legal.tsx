import type { ReactNode } from "react";
import { PageHero } from "@/components/ui";

export default function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHero label="Informations légales" title={title} line="" />
      <section className="sec cream" style={{ paddingTop: 0 }}><div className="wrap legal">{children}</div></section>
    </>
  );
}
