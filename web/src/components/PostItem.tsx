import { describeRoll } from "@/lib/dice";
import type { VisiblePost } from "@/lib/scene";

const timeFmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Berlin" });

export function PostItem({ post, viewerId }: { post: VisiblePost; viewerId: string }) {
  const name = post.speaker ?? (post.asGm ? "Spielleitung" : post.authorName);
  const classes = ["post"];
  if (post.asGm) classes.push("post-gm");
  if (post.visibility === "whisper") classes.push("post-whisper");
  if (post.visibility === "gm") classes.push("post-note");

  return (
    <article className={classes.join(" ")}>
      <header className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-semibold">{name}</span>
        {post.speaker && <span className="hint">(NSC, gespielt von {post.authorName})</span>}
        {post.visibility === "whisper" && (
          <span className="badge">
            {post.authorId === viewerId ? `Geflüstert an ${post.whisperToName}` : `Geflüstert von ${post.authorName}`}
          </span>
        )}
        {post.visibility === "gm" && <span className="badge badge-ember">Nur Spielleitung</span>}
        <time className="hint ml-auto" dateTime={post.createdAt.toISOString()}>{timeFmt.format(post.createdAt)}</time>
      </header>

      {post.body && <p className="whitespace-pre-line leading-relaxed">{post.body}</p>}

      {post.rollHidden && !post.roll && <p className="hint mt-2 italic">Die Spielleitung hat verdeckt gewürfelt.</p>}
      {post.roll && (
        <div className="roll">
          <span>{post.roll.expression}</span>
          <strong>{post.roll.total}</strong>
          <span className="hint">({describeRoll(post.roll)})</span>
          {post.rollHidden && <span className="badge">verdeckt</span>}
        </div>
      )}
    </article>
  );
}
