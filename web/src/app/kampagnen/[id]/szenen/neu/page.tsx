import Link from "next/link";
import { redirect } from "next/navigation";
import { createScene } from "@/app/actions/scene";
import { requireUser } from "@/lib/auth";
import { listMembers, requireCampaign } from "@/lib/campaign";
import { isGm } from "@/lib/visibility";

export const metadata = { title: "Neue Szene · Erzählfeuer" };

export default async function NewScenePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { id } = await params;
  const { fehler } = await searchParams;
  const user = await requireUser(`/kampagnen/${id}/szenen/neu`);
  const { campaign, role } = await requireCampaign(id, user.id);
  if (!isGm(role)) redirect(`/kampagnen/${id}`);
  const players = (await listMembers(id)).filter((m) => m.role === "player");

  return (
    <main className="page-narrow">
      <Link href={`/kampagnen/${id}`} className="hint">← {campaign.name}</Link>
      <h1 className="h1 mt-2">Neue Szene</h1>
      <form action={createScene.bind(null, id)} className="card space-y-5">
        <label className="field">
          <span>Titel</span>
          <input className="input" name="title" required minLength={2} maxLength={100} placeholder="z. B. Der alte Leuchtturm" />
        </label>
        <label className="field">
          <span>Einstieg (optional)</span>
          <textarea className="input" name="description" maxLength={4000} placeholder="Wo sind die Charaktere, was sehen sie?" />
        </label>

        <fieldset className="space-y-2">
          <legend className="field mb-1">Art der Szene</legend>
          <label className="check"><input type="radio" name="mode" value="async" defaultChecked /> Async – zwischen den Spielabenden</label>
          <label className="check"><input type="radio" name="mode" value="live" /> Live – alle spielen gleichzeitig</label>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="field mb-1">Wer darf die Szene sehen?</legend>
          <label className="check"><input type="radio" name="visibility" value="all" defaultChecked /> Alle in der Runde</label>
          <label className="check"><input type="radio" name="visibility" value="restricted" /> Nur ausgewählte Spieler:</label>
          {players.length === 0 ? (
            <p className="hint pl-6">Noch keine Spieler in der Kampagne.</p>
          ) : (
            <div className="flex flex-col gap-1 pl-6">
              {players.map((p) => (
                <label key={p.userId} className="check">
                  <input type="checkbox" name="participants" value={p.userId} /> {p.displayName}
                </label>
              ))}
            </div>
          )}
          <p className="hint">Die Spielleitung sieht immer alle Szenen.</p>
        </fieldset>

        {fehler === "titel" && <p className="error">Der Titel muss mindestens 2 Zeichen lang sein.</p>}
        <button className="btn btn-primary w-full">Szene eröffnen</button>
      </form>
    </main>
  );
}
