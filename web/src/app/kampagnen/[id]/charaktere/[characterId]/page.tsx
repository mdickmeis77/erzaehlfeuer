import Link from "next/link";
import { deleteCharacter, updateCharacterNotes, updateHitPoints } from "@/app/actions/character";
import { CharacterSheet } from "@/components/sheet/CharacterSheet";
import { ClearDraft } from "@/components/sheet/ClearDraft";
import { RollProvider } from "@/components/sheet/RollPanel";
import { requireUser } from "@/lib/auth";
import { requireCampaign } from "@/lib/campaign";
import { characterSummary, requireCharacter } from "@/lib/character";
import { listVisibleScenes } from "@/lib/scene";
import { isGm } from "@/lib/visibility";
import { computeSheet } from "@/rules/sheet";

export default async function CharacterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; characterId: string }>;
  searchParams: Promise<{ neu?: string; loeschen?: string }>;
}) {
  const { id, characterId } = await params;
  const { neu, loeschen } = await searchParams;
  const user = await requireUser(`/kampagnen/${id}/charaktere/${characterId}`);
  const { campaign, role } = await requireCampaign(id, user.id);
  const viewer = { userId: user.id, role };
  const character = await requireCharacter(id, characterId, viewer);
  const sheet = computeSheet(character.build, character.level);
  const scenes = (await listVisibleScenes(id, viewer)).filter((s) => !s.closedAt).map((s) => ({ id: s.id, title: s.title }));
  const hpPercent = Math.round((character.hpCurrent / sheet.hpMax) * 100);

  return (
    <main className="page max-w-4xl pb-40">
      {neu && <ClearDraft campaignId={id} />}
      <Link href={`/kampagnen/${id}`} className="hint">
        ← {campaign.name}
      </Link>
      <div className="mt-2 mb-4">
        <h1 className="h1 mb-1">{character.name}</h1>
        <p className="text-muted">
          {characterSummary(character)} · {sheet.backgroundName}
        </p>
        {character.ownerId !== user.id && <p className="hint">Gespielt von einem anderen Mitglied – du siehst den Bogen als Spielleitung.</p>}
      </div>

      {neu && <p className="card mb-4 border-ember">Dein Charakter ist fertig. Tippe auf einen Wert, um in eine Szene zu würfeln.</p>}

      <RollProvider campaignId={id} characterId={character.id} characterName={character.name} scenes={scenes} isGm={isGm(role)}>
        {/* Trefferpunkte */}
        <section className="card mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="h2 mb-0">Trefferpunkte</h2>
            <p>
              <span className="text-2xl font-bold">{character.hpCurrent}</span>
              <span className="text-muted"> / {sheet.hpMax}</span>
              {character.hpTemp > 0 && <span className="badge badge-ember ml-2">+{character.hpTemp} temporär</span>}
            </p>
          </div>
          <div className="hp-bar mt-2" role="meter" aria-valuemin={0} aria-valuemax={sheet.hpMax} aria-valuenow={character.hpCurrent} aria-label="Trefferpunkte">
            <div style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }} />
          </div>
          <form action={updateHitPoints.bind(null, id, character.id)} className="mt-3 flex flex-wrap items-center gap-2">
            <input className="input !w-24" type="number" name="amount" min={0} max={999} defaultValue={1} aria-label="Anzahl Trefferpunkte" />
            <button className="btn" name="op" value="damage">Schaden</button>
            <button className="btn" name="op" value="heal">Heilen</button>
            <button className="btn" name="op" value="temp">Temporäre TP</button>
            <button className="btn btn-quiet ml-auto" name="op" value="rest">Lange Rast</button>
          </form>
          <p className="hint mt-2">Trefferwürfel: {sheet.hitDice}</p>
        </section>

        <CharacterSheet sheet={sheet} />
      </RollProvider>

      {/* Persönliches */}
      <section className="card mt-4">
        <h2 className="h2">Persönliches</h2>
        <form action={updateCharacterNotes.bind(null, id, character.id)} className="space-y-3">
          <label className="field">
            <span>Name</span>
            <input className="input" name="name" defaultValue={character.name} minLength={2} maxLength={60} required />
          </label>
          <label className="field">
            <span>Aussehen</span>
            <textarea className="input" name="appearance" defaultValue={character.appearance} maxLength={2000} />
          </label>
          <label className="field">
            <span>Hintergrundgeschichte</span>
            <textarea className="input min-h-40" name="backstory" defaultValue={character.backstory} maxLength={8000} />
          </label>
          <button className="btn">Speichern</button>
        </form>
      </section>

      <details className="card mt-4">
        <summary className="cursor-pointer font-semibold">Charakter löschen</summary>
        <form action={deleteCharacter.bind(null, id, character.id)} className="mt-3 space-y-3">
          <p className="hint">Das kann nicht rückgängig gemacht werden. Tippe zur Bestätigung den Namen „{character.name}“ ein.</p>
          <input className="input" name="confirm" autoComplete="off" aria-label="Name zur Bestätigung" />
          {loeschen === "falsch" && <p className="error">Der Name stimmt nicht überein.</p>}
          <button className="btn">Endgültig löschen</button>
        </form>
      </details>

      <p className="hint mt-6 text-xs">
        Regeln nach SRD 5.2 (CC-BY 4.0), ins Deutsche übertragen. <Link className="link" href="/lizenz">Lizenzhinweis</Link>
      </p>
    </main>
  );
}
