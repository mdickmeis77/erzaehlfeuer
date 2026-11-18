import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Composer } from "@/components/Composer";
import { PostItem } from "@/components/PostItem";
import { requireUser } from "@/lib/auth";
import { listMembers, requireCampaign } from "@/lib/campaign";
import { listSceneParticipants, listVisiblePosts, requireScene } from "@/lib/scene";
import { isGm } from "@/lib/visibility";

export default async function ScenePage({ params }: { params: Promise<{ id: string; sceneId: string }> }) {
  const { id, sceneId } = await params;
  const user = await requireUser(`/kampagnen/${id}/szenen/${sceneId}`);
  const { campaign, role } = await requireCampaign(id, user.id);
  const viewer = { userId: user.id, role };
  const scene = await requireScene(id, sceneId, viewer);
  const gm = isGm(role);

  const [posts, members, participants] = await Promise.all([
    listVisiblePosts(sceneId, viewer),
    listMembers(id),
    scene.visibility === "restricted" ? listSceneParticipants(sceneId) : Promise.resolve([]),
  ]);

  // Spielleitung flüstert an Spieler (in privaten Szenen nur an Teilnehmer), Spieler nur an die SL
  const participantIds = new Set(participants.map((p) => p.userId));
  const whisperTargets = members.filter((m) => {
    if (m.userId === user.id) return false;
    if (!gm) return isGm(m.role);
    return scene.visibility === "all" || participantIds.has(m.userId) || isGm(m.role);
  });

  return (
    <main className="page max-w-3xl">
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
        <Composer campaignId={id} sceneId={sceneId} isGm={gm} whisperTargets={whisperTargets} />
      </section>
    </main>
  );
}
