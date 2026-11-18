import Link from "next/link";
import { CharacterWizard } from "@/components/wizard/CharacterWizard";
import { requireUser } from "@/lib/auth";
import { requireCampaign } from "@/lib/campaign";

export default async function NewCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/kampagnen/${id}/charaktere/neu`);
  const { campaign } = await requireCampaign(id, user.id);

  return (
    <main className="page max-w-3xl">
      <Link href={`/kampagnen/${id}`} className="hint">
        ← {campaign.name}
      </Link>
      <h1 className="h1 mt-2">Neuer Charakter</h1>
      <CharacterWizard campaignId={id} methods={campaign.abilityMethods} />
    </main>
  );
}
