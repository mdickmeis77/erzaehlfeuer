import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser, safeNext } from "@/lib/auth";

export const metadata = { title: "Anmelden · Erzählfeuer" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ weiter?: string }> }) {
  const next = safeNext((await searchParams).weiter);
  if (await getCurrentUser()) redirect(next);
  return (
    <main className="page-narrow">
      <h1 className="h1">Anmelden</h1>
      <AuthForm mode="login" next={next} />
    </main>
  );
}
