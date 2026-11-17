import { SystemPanel } from "@/components/system/Panel";
import { Button } from "@/components/ui/Button";
import { unsubscribe } from "./actions";

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ t?: string; done?: string }> }) {
  const sp = await searchParams;
  if (sp.done) {
    return (
      <SystemPanel title="You've been unsubscribed">
        <p className="text-ivory-muted">You won’t receive any further business-development e-mails from Mendes. Thank you for letting us know.</p>
      </SystemPanel>
    );
  }
  return (
    <SystemPanel title="Unsubscribe">
      <p className="text-ivory-muted">Confirm that you no longer wish to receive e-mails from Mendes Law &amp; Consultancy.</p>
      <form action={unsubscribe} className="mt-8">
        <input type="hidden" name="t" value={sp.t ?? ""} />
        <Button>Confirm unsubscribe</Button>
      </form>
    </SystemPanel>
  );
}
