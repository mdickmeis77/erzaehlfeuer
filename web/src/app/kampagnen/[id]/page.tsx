import Link from "next/link";
import { headers } from "next/headers";
import { createInvite } from "@/app/actions/campaign";
import { setAbilityMethods } from "@/app/actions/character";
import { CopyButton } from "@/components/CopyButton";
import { requireUser } from "@/lib/auth";
import { listMembers, requireCampaign, ROLE_LABEL } from "@/lib/campaign";
import { listCharacters } from "@/lib/character";
import { ABILITY_METHODS } from "@/rules/core";
import { listVisibleScenes } from "@/lib/scene";
import { isGm } from "@/lib/visibility";

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ einladung?: string; einstellung?: string }>;
}) {
  const { id } = await params;
  const { einladung, einstellung } = await searchParams;
  const user = await requireUser(`/kampagnen/${id}`);
  const { campaign, role } = await requireCampaign(id, user.id);
  const gm = isGm(role);
  const [scenes, members, characters] = await Promise.all([listVisibleScenes(id, { userId: user.id, role }), listMembers(id), listCharacters(id)]);
  const ownCharacters = characters.filter((c) => c.ownerId === user.id);

  let inviteUrl: string | null = null;
  if (gm && einladung) {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    inviteUrl = `${proto}://${h.get("host")}/einladung/${einladung}`;
  }

  return (
    <main className="page">
      <p className="eyebrow">{ROLE_LABEL[role]}</p>
      <h1 className="h1 mb-2">{campaign.name}</h1>
      {campaign.description && <p className="mb-6 max-w-2xl text-muted whitespace-pre-line">{campaign.description}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="h2 mb-0">Szenen</h2>
            {gm && <Link className="btn btn-primary" href={`/kampagnen/${id}/szenen/neu`}>Neue Szene</Link>}
          </div>
          {scenes.length === 0 ? (
            <p className="card text-muted">
              {gm ? "Noch keine Szene. Eröffne die erste, damit deine Runde loslegen kann." : "Die Spielleitung hat noch keine Szene eröffnet."}
            </p>
          ) : (
            <ul className="space-y-3">
              {scenes.map((s) => (
                <li key={s.id}>
                  <Link href={`/kampagnen/${id}/szenen/${s.id}`} className="card card-link">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{s.title}</span>
                      <span className={s.mode === "live" ? "badge badge-ember" : "badge"}>{s.mode === "live" ? "Live" : "Async"}</span>
                      {s.visibility === "restricted" && <span className="badge">Privat</span>}
                    </div>
                    {s.description && <p className="hint mt-1 line-clamp-2">{s.description}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="h2 mb-0">Charaktere</h2>
              <Link className={ownCharacters.length === 0 && !gm ? "btn btn-primary" : "btn"} href={`/kampagnen/${id}/charaktere/neu`}>
                Neu
              </Link>
            </div>
            {characters.length === 0 ? (
              <p className="hint">{gm ? "Noch keine Charaktere. Deine Spieler erstellen sie über „Neu“." : "Erstelle deinen Charakter, um loszulegen."}</p>
            ) : (
              <ul className="space-y-2">
                {characters.map((c) => {
                  const canOpen = gm || c.ownerId === user.id;
                  const body = (
                    <>
                      <span className="font-semibold">{c.name}</span>
                      <span className="hint block">{c.summary}</span>
                      <span className="hint block text-xs">{c.ownerId === user.id ? "dein Charakter" : c.ownerName}</span>
                    </>
                  );
                  return (
                    <li key={c.id}>
                      {canOpen ? (
                        <Link href={`/kampagnen/${id}/charaktere/${c.id}`} className="card card-link !p-3">{body}</Link>
                      ) : (
                        <div className="card !p-3">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card">
            <h2 className="h2">Runde</h2>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.userId} className="flex items-center justify-between gap-2">
                  <span>{m.displayName}</span>
                  <span className={m.role === "player" ? "badge" : "badge badge-ember"}>{ROLE_LABEL[m.role]}</span>
                </li>
              ))}
            </ul>
          </div>

          {gm && (
            <div className="card space-y-3">
              <h2 className="h2 mb-0">Spieler einladen</h2>
              {inviteUrl ? (
                <>
                  <p className="hint">Schick diesen Link an deine Spieler. Er ist 14 Tage gültig.</p>
                  <input className="input text-sm" readOnly value={inviteUrl} aria-label="Einladungslink" />
                  <CopyButton text={inviteUrl} label="Link kopieren" />
                </>
              ) : (
                <form action={createInvite.bind(null, id)}>
                  <button className="btn w-full">Einladungslink erstellen</button>
                </form>
              )}
            </div>
          )}

          {gm && (
            <form action={setAbilityMethods.bind(null, id)} className="card space-y-2">
              <h2 className="h2 mb-1">Attributswerte</h2>
              <p className="hint">Welche Wege dürfen Spieler beim Erstellen nutzen?</p>
              {ABILITY_METHODS.map((m) => (
                <label key={m.id} className="check w-full">
                  <input type="checkbox" name={m.id} defaultChecked={campaign.abilityMethods.includes(m.id)} /> {m.name}
                </label>
              ))}
              {einstellung === "leer" && <p className="error">Mindestens ein Weg muss erlaubt sein.</p>}
              <button className="btn w-full">Speichern</button>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}
