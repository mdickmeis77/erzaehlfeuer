import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Composer } from "@/components/Composer";
import { PostItem } from "@/components/PostItem";
import { QuickChecks } from "@/components/sheet/QuickChecks";
import { RollProvider } from "@/components/sheet/RollPanel";
import { requireUser } from "@/lib/auth";
import { listMembers, requireCampaign } from "@/lib/campaign";
import { listOwnCharacters } from "@/lib/character";
import { listSceneParticipants, listVisiblePosts, requireScene } from "@/lib/scene";
import { isGm } from "@/lib/visibility";
import { computeSheet } from "@/rules/sheet";

export default async function ScenePage({ params }: { params: Promise<{ id: string; sceneId: string }> }) {
  const { id, sceneId } = await params;
  const user = await requireUser(`/kampagnen/${id}/szenen/${sceneId}`);
  const { campaign, role } = await requireCampaign(id, user.id);
  const viewer = { userId: user.id, role };
  const scene = await requireScene(id, sceneId, viewer);
  const gm = isGm(role);

  const [posts, members, participants, characters] = await Promise.all([
    listVisiblePosts(sceneId, viewer),
    listMembers(id),
    scene.visibility === "restricted" ? listSceneParticipants(sceneId) : Promise.resolve([]),
    listOwnCharacters(id, user.id),
  ]);

  // Spielleitung flüstert an Spieler (in privaten Szenen nur an Teilnehmer), Spieler nur an die SL
  const participantIds = new Set(participants.map((p) => p.userId));
  const whisperTargets = members.filter((m) => {
    if (m.userId === user.id) return false;
    if (!gm) return isGm(m.role);
    return scene.visibility === "all" || participantIds.has(m.userId) || isGm(m.role);
  });

  return (
    <main className="page max-w-3xl pb-40">
      <AutoRefresh intervalMs={scene.mode === "live" ? 4000 : 30000} />
      <Link href={`/kampagnen/${id}`} className="hint">← {campaign.name}</Link>
      <div className="mt-2 mb-1 flex flex-wrap items-center gap-2">
        <h1 className="h1 mb-0">{scene.title}</h1>
        <span className={scene.mode === "live" ? "badge badge-ember" : "badge"}>{scene.mode === "live" ? "Live" : "Async"}</span>
        {scene.visibility === "restricted" && <span className="badge">Privat</span>}
      </div>
      {scene.visibility === "restricted" && (
        <p className="hint mb-2">Sichtbar für: Spielleitung{participants.length > 0 && `, ${participants.map((p) => p.displayName).join(", ")}`}</p>
      )}
      {scene.description && <p className="post post-gm mt-3 whitespace-pre-line">{scene.description}</p>}

      <section className="mt-5 space-y-3" aria-label="Verlauf der Szene">
        {posts.length === 0 ? (
          <p className="hint">Noch keine Beiträge. {gm ? "Eröffne die Szene mit einer Beschreibung." : "Warte auf die Spielleitung – oder leg einfach los."}</p>
        ) : (
          posts.map((p) => <PostItem key={p.id} post={p} viewerId={user.id} />)
        )}
      </section>

      <section className="mt-6">
        <Composer
          campaignId={id}
          sceneId={sceneId}
          isGm={gm}
          whisperTargets={whisperTargets}
          characters={characters.map((c) => ({ id: c.id, name: c.name }))}
        />
      </section>

      {characters.map((c) => (
        <details key={c.id} className="card mt-4">
          <summary className="cursor-pointer font-semibold">Würfeln als {c.name}</summary>
          <div className="mt-3">
            <RollProvider campaignId={id} characterId={c.id} characterName={c.name} scenes={[]} fixedSceneId={sceneId} isGm={gm}>
              <QuickChecks sheet={computeSheet(c.build, c.level)} />
            </RollProvider>
            <Link href={`/kampagnen/${id}/charaktere/${c.id}`} className="link mt-3 inline-block text-sm">
              Ganzen Charakterbogen öffnen
            </Link>
          </div>
        </details>
      ))}
    </main>
  );
}
