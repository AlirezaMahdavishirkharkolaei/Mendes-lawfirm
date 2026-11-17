import { getFile } from "@/lib/storage";
import { getArticle } from "@/lib/data/articles";
import { currentUser, isStaff } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getArticle((await params).id);
  if (!a?.attachment_key) return new Response("Not found", { status: 404 });
  if (a.status !== "published") {
    const user = await currentUser();
    if (!(isStaff(user) || user?.id === a.author_id)) return new Response("Not found", { status: 404 });
  }
  const obj = await getFile(a.attachment_key);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${encodeURIComponent(a.attachment_name || a.slug + ".pdf")}"`,
      "cache-control": a.status === "published" ? "public, max-age=3600" : "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
