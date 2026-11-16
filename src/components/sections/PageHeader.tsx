import { Breadcrumbs, SectionLabel } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";
import type { BreadcrumbItem } from "@/components/ui";

/** Title block shared by inner pages. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: BreadcrumbItem[];
}) {
  return (
    <SectionContainer className="pb-8 pt-8 md:pb-12 md:pt-12 lg:pb-16">
      <PageContainer className="flex flex-col gap-6">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <SectionLabel as="p">{eyebrow}</SectionLabel>}
        <h1 className="max-w-4xl text-balance font-display text-h1 tracking-display text-ink md:text-display">{title}</h1>
        {lead && <p className="max-w-2xl font-body text-lead text-ink-muted">{lead}</p>}
      </PageContainer>
    </SectionContainer>
  );
}
