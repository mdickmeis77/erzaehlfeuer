import Link from "next/link";
import { headers } from "next/headers";
import { createInvite } from "@/app/actions/campaign";
import { CopyButton } from "@/components/CopyButton";
import { requireUser } from "@/lib/auth";
import { listMembers, requireCampaign, ROLE_LABEL } from "@/lib/campaign";
import { listVisibleScenes } from "@/lib/scene";
import { isGm } from "@/lib/visibility";

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ einladung?: string }>;
}) {
  const { id } = await params;
  const { einladung } = await searchParams;
  const user = await requireUser(`/kampagnen/${id}`);
  const { campaign, role } = await requireCampaign(id, user.id);
  const gm = isGm(role);
  const [scenes, members] = await Promise.all([listVisibleScenes(id, { userId: user.id, role }), listMembers(id)]);

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
        </aside>
      </div>
    </main>
  );
}
