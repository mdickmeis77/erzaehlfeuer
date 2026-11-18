import { createCampaign } from "@/app/actions/campaign";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Neue Kampagne · Erzählfeuer" };

export default async function NewCampaignPage({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  await requireUser("/kampagnen/neu");
  const { fehler } = await searchParams;
  return (
    <main className="page-narrow">
      <p className="eyebrow">Du wirst die Spielleitung</p>
      <h1 className="h1">Neue Kampagne</h1>
      <form action={createCampaign} className="card space-y-4">
        <label className="field">
          <span>Name der Kampagne</span>
          <input className="input" name="name" required minLength={2} maxLength={80} placeholder="z. B. Die Nebelküste" />
        </label>
        <label className="field">
          <span>Worum geht es? (optional)</span>
          <textarea className="input" name="description" maxLength={2000} placeholder="Ein, zwei Sätze für deine Spieler" />
        </label>
        {fehler === "name" && <p className="error">Der Name muss mindestens 2 Zeichen lang sein.</p>}
        <button className="btn btn-primary w-full">Kampagne anlegen</button>
      </form>
    </main>
  );
}
