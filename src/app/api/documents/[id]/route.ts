import { currentUser } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { canAccessCase, getCase, getDocument } from "@/lib/data/cases";
import { audit } from "@/lib/settings";

/** Streams a case document from R2 after checking the viewer may access the case. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const doc = await getDocument((await params).id);
  if (!doc) return new Response("Not found", { status: 404 });
  const c = await getCase(doc.case_id);
  if (!c || !canAccessCase(user, c)) return new Response("Not found", { status: 404 });
  const obj = await getEnv().FILES.get(doc.r2_key);
  if (!obj) return new Response("Not found", { status: 404 });
  await audit(user.email, "document.downloaded", "document", doc.id);
  const inline = doc.mime_type === "application/pdf" || doc.mime_type.startsWith("image/");
  return new Response(obj.body, {
    headers: {
      "content-type": doc.mime_type,
      "content-disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(doc.filename)}`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
