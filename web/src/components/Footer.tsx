import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line pt-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
        <span>© Erzählfeuer</span>
        <nav className="flex flex-wrap gap-4">
          <Link href="/impressum" className="hover:text-text">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-text">Datenschutz</Link>
          <Link href="/lizenz" className="hover:text-text">Lizenzhinweis</Link>
        </nav>
      </div>
    </footer>
  );
}
