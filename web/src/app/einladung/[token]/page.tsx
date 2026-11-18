import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { acceptInvite } from "@/app/actions/campaign";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Einladung · Erzählfeuer" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [invite] = await getDb()
    .select({ expiresAt: schema.invites.expiresAt, campaignName: schema.campaigns.name })
    .from(schema.invites)
    .innerJoin(schema.campaigns, eq(schema.campaigns.id, schema.invites.campaignId))
    .where(eq(schema.invites.token, token));

  if (!invite || invite.expiresAt < new Date()) {
    return (
      <main className="page-narrow">
        <h1 className="h1">Einladung ungültig</h1>
        <p className="card text-muted">
          Dieser Link ist abgelaufen oder existiert nicht. Bitte deine Spielleitung um einen neuen.
        </p>
      </main>
    );
  }

  const user = await getCurrentUser();
  const here = `/einladung/${token}`;
  return (
    <main className="page-narrow">
      <p className="eyebrow">Einladung</p>
      <h1 className="h1">{invite.campaignName}</h1>
      <div className="card space-y-4">
        <p>Du wurdest als Spieler in diese Kampagne eingeladen.</p>
        {user ? (
          <form action={acceptInvite.bind(null, token)}>
            <button className="btn btn-primary w-full">Als {user.displayName} beitreten</button>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            <Link className="btn btn-primary" href={`/registrieren?weiter=${encodeURIComponent(here)}`}>Konto erstellen und beitreten</Link>
            <Link className="btn" href={`/anmelden?weiter=${encodeURIComponent(here)}`}>Ich habe schon ein Konto</Link>
          </div>
        )}
      </div>
    </main>
  );
}
