import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/data/articles";
import { renderMarkdown, readingMinutes } from "@/lib/markdown";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ButtonLink } from "@/components/ui/Button";
import { reviewArticleAdmin } from "@/app/(system)/admin/actions";

export default async function ArticleReview({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const a = await getArticle((await params).id);
  if (!a) notFound();
  return (
    <AdminPage title={a.title} lead={`${a.author_name}${a.author_university ? ` · ${a.author_university}` : ""} · ${readingMinutes(a.body)} min read · ${a.body.split(/\s+/).length} words`} actions={<ButtonLink href={`/${a.locale}/insights/${a.slug}`} variant="outline" size="sm">Preview on site ↗</ButtonLink>}>
      <div className="grid gap-10 xl:grid-cols-2">
        <Panel title="Decision">
          <ActionForm action={reviewArticleAdmin}>
            <input type="hidden" name="id" value={a.id} />
            <Field label="Decision" htmlFor="status">
              <Select id="status" name="status" defaultValue={a.status === "submitted" ? "published" : a.status}>
                <option value="published">Publish</option>
                <option value="revision">Request revision</option>
                <option value="rejected">Reject</option>
                <option value="submitted">Back to review queue</option>
              </Select>
            </Field>
            <Field label="Note to the author (e-mailed)" htmlFor="note"><Textarea id="note" name="note" rows={4} defaultValue={a.reviewer_note ?? ""} /></Field>
            <details className="rounded-[3px] border border-line p-4">
              <summary className="cursor-pointer text-ui text-gold">Edit content before publishing</summary>
              <div className="mt-5 space-y-4">
                <Checkbox name="save_content" label="Save the edits below" />
                <Field label="Title" htmlFor="title"><Input id="title" name="title" defaultValue={a.title} /></Field>
                <Field label="Abstract" htmlFor="abstract"><Textarea id="abstract" name="abstract" rows={4} defaultValue={a.abstract} /></Field>
                <Field label="Body (Markdown)" htmlFor="body"><Textarea id="body" name="body" rows={16} className="font-mono text-ui-sm" defaultValue={a.body} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Keywords" htmlFor="keywords"><Input id="keywords" name="keywords" defaultValue={a.keywords.join(", ")} /></Field>
                  <Field label="Category" htmlFor="category"><Input id="category" name="category" defaultValue={a.category ?? ""} /></Field>
                </div>
              </div>
            </details>
            <SubmitButton pending="Saving…">Save decision</SubmitButton>
          </ActionForm>
          {a.attachment_key && <a href={`/api/articles/${a.id}/pdf`} className="mt-6 inline-block text-ui text-gold">Open attached PDF ↗</a>}
        </Panel>
        <Panel title="Submission">
          <p className="font-display text-xl italic text-ivory/85">{a.abstract}</p>
          <div className="prose-luxe mt-8 max-h-[70vh] overflow-y-auto pe-2 text-ui" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />
        </Panel>
      </div>
    </AdminPage>
  );
}
