import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl">
          <span aria-hidden className="text-ember">🔥</span>
          Erzählfeuer
        </Link>
        {user ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">{user.displayName}</span>
            <form action={logout}>
              <button className="btn btn-quiet">Abmelden</button>
            </form>
          </div>
        ) : (
          <nav className="flex items-center gap-2 text-sm">
            <Link className="btn btn-quiet" href="/anmelden">Anmelden</Link>
            <Link className="btn btn-primary" href="/registrieren">Registrieren</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
