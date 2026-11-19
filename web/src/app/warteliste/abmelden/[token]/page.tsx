import Link from "next/link";
import { redirect } from "next/navigation";
import { leaveWaitlist } from "@/app/actions/waitlist";

export const metadata = { title: "Von der Warteliste austragen – Erzählfeuer", robots: { index: false } };

// Austragen erst per Knopfdruck, nicht schon beim Öffnen des Links (manche Mailprogramme öffnen Links vorab)
export default async function LeaveWaitlistPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ erledigt?: string }> }) {
  const { token } = await params;
  const { erledigt } = await searchParams;

  async function leave() {
    "use server";
    await leaveWaitlist(token);
    redirect(`/warteliste/abmelden/${token}?erledigt=1`);
  }

  return (
    <main className="page-narrow">
      <h1 className="h1">Warteliste</h1>
      {erledigt ? (
        <div className="card space-y-3">
          <p>Du bist ausgetragen. Wir haben deine E-Mail-Adresse gelöscht.</p>
          <Link className="link" href="/">Zur Startseite</Link>
        </div>
      ) : (
        <form action={leave} className="card space-y-3">
          <p>Möchtest du dich von der Warteliste austragen? Deine E-Mail-Adresse wird dann gelöscht.</p>
          <button className="btn btn-primary">Austragen</button>
        </form>
      )}
    </main>
  );
}
